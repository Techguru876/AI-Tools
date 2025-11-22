"""
Job scraper service for discovering job listings from multiple job boards.
Uses Playwright for web scraping with rotating user agents and rate limiting.
"""
import asyncio
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from playwright.async_api import async_playwright, Page, Browser
import random


class JobScraper:
    """
    Scrapes job listings from various job boards.

    Supports:
    - Indeed
    - LinkedIn (basic)
    - Generic job boards
    """

    USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ]

    def __init__(self, headless: bool = True, delay: int = 2):
        """
        Initialize job scraper.

        Args:
            headless: Run browser in headless mode
            delay: Delay between requests in seconds
        """
        self.headless = headless
        self.delay = delay
        self.browser: Optional[Browser] = None

    async def __aenter__(self):
        """Async context manager entry."""
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()

    async def start(self):
        """Start the browser."""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=self.headless)

    async def close(self):
        """Close the browser."""
        if self.browser:
            await self.browser.close()

    def _get_random_user_agent(self) -> str:
        """Get a random user agent."""
        return random.choice(self.USER_AGENTS)

    async def _delay(self):
        """Add delay between requests."""
        await asyncio.sleep(self.delay + random.uniform(0, 1))

    def _parse_salary(self, salary_text: str) -> Dict[str, Optional[int]]:
        """
        Parse salary text into min/max values.

        Args:
            salary_text: Raw salary text

        Returns:
            Dict with salary_min and salary_max
        """
        if not salary_text:
            return {'salary_min': None, 'salary_max': None}

        # Remove common prefixes
        salary_text = salary_text.lower().replace('$', '').replace(',', '').replace('k', '000')

        # Try to find range (e.g., "60000 - 80000")
        range_match = re.search(r'(\d+)\s*-\s*(\d+)', salary_text)
        if range_match:
            return {
                'salary_min': int(range_match.group(1)),
                'salary_max': int(range_match.group(2))
            }

        # Try to find single value
        single_match = re.search(r'(\d+)', salary_text)
        if single_match:
            value = int(single_match.group(1))
            return {'salary_min': value, 'salary_max': value}

        return {'salary_min': None, 'salary_max': None}

    async def scrape_indeed(
        self,
        query: str,
        location: str = '',
        max_results: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Scrape jobs from Indeed.

        Args:
            query: Search query (job title, keywords)
            location: Location filter
            max_results: Maximum number of results to return

        Returns:
            List of job dictionaries
        """
        if not self.browser:
            raise RuntimeError("Browser not started. Call start() first.")

        jobs = []

        # Create new page with random user agent
        page = await self.browser.new_page(
            user_agent=self._get_random_user_agent()
        )

        try:
            # Build search URL
            base_url = "https://www.indeed.com/jobs"
            params = []
            if query:
                params.append(f"q={query.replace(' ', '+')}")
            if location:
                params.append(f"l={location.replace(' ', '+')}")

            search_url = f"{base_url}?{'&'.join(params)}"

            # Navigate to search results
            await page.goto(search_url, wait_until='networkidle')
            await self._delay()

            # Extract job cards
            job_cards = await page.query_selector_all('.job_seen_beacon, .jobsearch-SerpJobCard')

            for i, card in enumerate(job_cards[:max_results]):
                try:
                    # Extract job data
                    title_elem = await card.query_selector('h2.jobTitle, .jobTitle span')
                    company_elem = await card.query_selector('.companyName')
                    location_elem = await card.query_selector('.companyLocation')
                    salary_elem = await card.query_selector('.salary-snippet')
                    link_elem = await card.query_selector('a[data-jk], h2 a')

                    # Get text content
                    title = await title_elem.inner_text() if title_elem else 'Unknown Title'
                    company = await company_elem.inner_text() if company_elem else 'Unknown Company'
                    job_location = await location_elem.inner_text() if location_elem else location
                    salary_text = await salary_elem.inner_text() if salary_elem else ''

                    # Get job URL
                    job_url = ''
                    if link_elem:
                        href = await link_elem.get_attribute('href')
                        if href:
                            job_url = f"https://www.indeed.com{href}" if href.startswith('/') else href

                    # Parse salary
                    salary_info = self._parse_salary(salary_text)

                    # Create job object
                    job = {
                        'title': title.strip(),
                        'company': company.strip(),
                        'location': job_location.strip(),
                        'salary_range': salary_text.strip() if salary_text else None,
                        'salary_min': salary_info['salary_min'],
                        'salary_max': salary_info['salary_max'],
                        'url': job_url,
                        'description': '',  # Would need to visit each job page
                        'remote': 'remote' in job_location.lower(),
                        'job_board': 'Indeed',
                        'scraped_date': datetime.utcnow()
                    }

                    jobs.append(job)

                except Exception as e:
                    print(f"Error parsing job card: {str(e)}")
                    continue

        except Exception as e:
            print(f"Error scraping Indeed: {str(e)}")
        finally:
            await page.close()

        return jobs

    async def scrape_generic(
        self,
        url: str,
        selectors: Dict[str, str],
        max_results: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Scrape jobs from a generic job board using custom selectors.

        Args:
            url: URL to scrape
            selectors: Dict of CSS selectors for job data
            max_results: Maximum results

        Returns:
            List of job dictionaries
        """
        if not self.browser:
            raise RuntimeError("Browser not started. Call start() first.")

        jobs = []
        page = await self.browser.new_page(user_agent=self._get_random_user_agent())

        try:
            await page.goto(url, wait_until='networkidle')
            await self._delay()

            job_cards = await page.query_selector_all(selectors.get('card', '.job-card'))

            for card in job_cards[:max_results]:
                try:
                    job = {
                        'title': '',
                        'company': '',
                        'location': '',
                        'salary_range': None,
                        'url': url,
                        'description': '',
                        'remote': False,
                        'job_board': 'Generic',
                        'scraped_date': datetime.utcnow()
                    }

                    # Extract using provided selectors
                    for field, selector in selectors.items():
                        if field == 'card':
                            continue
                        elem = await card.query_selector(selector)
                        if elem:
                            text = await elem.inner_text()
                            job[field] = text.strip()

                    jobs.append(job)

                except Exception as e:
                    print(f"Error parsing generic job: {str(e)}")
                    continue

        except Exception as e:
            print(f"Error scraping generic URL: {str(e)}")
        finally:
            await page.close()

        return jobs

    def create_mock_jobs(self, count: int = 10) -> List[Dict[str, Any]]:
        """
        Create mock job listings for testing without actual scraping.

        Args:
            count: Number of mock jobs to create

        Returns:
            List of mock job dictionaries
        """
        companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'SpaceX']
        titles = [
            'Senior Software Engineer', 'Full Stack Developer', 'Backend Engineer',
            'Frontend Developer', 'DevOps Engineer', 'Data Scientist', 'ML Engineer',
            'Product Manager', 'Engineering Manager', 'Solutions Architect'
        ]
        locations = ['San Francisco, CA', 'Seattle, WA', 'Austin, TX', 'New York, NY', 'Remote']

        skills_pool = [
            'Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
            'PostgreSQL', 'MongoDB', 'FastAPI', 'Django', 'TypeScript', 'GraphQL',
            'Machine Learning', 'Data Analysis', 'CI/CD', 'Microservices'
        ]

        jobs = []
        for i in range(count):
            company = random.choice(companies)
            title = random.choice(titles)
            location = random.choice(locations)
            salary_min = random.randint(80, 150) * 1000
            salary_max = salary_min + random.randint(20, 50) * 1000

            # Random skills (3-7 skills)
            num_skills = random.randint(3, 7)
            required_skills = random.sample(skills_pool, num_skills)

            job = {
                'title': title,
                'company': company,
                'location': location,
                'salary_range': f'${salary_min:,} - ${salary_max:,}',
                'salary_min': salary_min,
                'salary_max': salary_max,
                'url': f'https://jobs.example.com/{i+1}',
                'description': f'We are seeking a talented {title} to join our team at {company}. '
                              f'The ideal candidate will have experience with {", ".join(required_skills[:3])}. '
                              f'This is a {"remote" if location == "Remote" else "on-site"} position.',
                'remote': location == 'Remote',
                'job_type': random.choice(['full-time', 'contract', 'part-time']),
                'required_skills': required_skills,
                'job_board': 'Mock',
                'scraped_date': datetime.utcnow(),
                'is_active': True
            }

            jobs.append(job)

        return jobs


# Convenience function for quick scraping
async def scrape_jobs(query: str, location: str = '', max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Quick function to scrape jobs from Indeed.

    Args:
        query: Search query
        location: Location filter
        max_results: Max results

    Returns:
        List of job dictionaries
    """
    async with JobScraper() as scraper:
        return await scraper.scrape_indeed(query, location, max_results)
