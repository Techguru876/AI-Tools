"""
Job matching service for calculating compatibility between resumes and jobs.
Uses keyword matching, skill overlap, and experience matching algorithms.
"""
from typing import Dict, List, Any, Set
import re
from collections import Counter


class JobMatcher:
    """
    Matches jobs with resume data and calculates match scores.

    Scoring algorithm:
    - Skills match: 50 points
    - Title/description keywords: 30 points
    - Experience level: 10 points
    - Location preference: 10 points
    """

    def __init__(self):
        """Initialize job matcher."""
        # Common tech keywords for matching
        self.tech_keywords = {
            'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
            'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'dotnet',
            'c++', 'c#', 'go', 'rust', 'kotlin', 'swift', 'php', 'ruby',
            'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
            'git', 'ci/cd', 'jenkins', 'github actions', 'gitlab ci',
            'rest api', 'graphql', 'grpc', 'microservices', 'serverless',
            'machine learning', 'deep learning', 'ai', 'data science',
            'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn'
        }

    def calculate_match_score(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any],
        preferences: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Calculate match score between a resume and job.

        Args:
            resume_data: Parsed resume data
            job_data: Job listing data
            preferences: User preferences (optional)

        Returns:
            Dict containing match score and breakdown
        """
        if preferences is None:
            preferences = {}

        # Extract resume skills
        resume_skills = self._normalize_skills(resume_data.get('skills', []))

        # Extract job required skills
        job_skills = self._normalize_skills(job_data.get('required_skills', []))

        # Extract keywords from job description
        job_text = f"{job_data.get('title', '')} {job_data.get('description', '')}"
        job_keywords = self._extract_keywords(job_text)

        # Calculate scores
        skills_score = self._calculate_skills_match(resume_skills, job_skills, job_keywords)
        keyword_score = self._calculate_keyword_match(resume_data, job_data)
        experience_score = self._calculate_experience_match(resume_data, job_data)
        location_score = self._calculate_location_match(resume_data, job_data, preferences)

        # Calculate total score (weighted average)
        total_score = (
            skills_score * 0.5 +
            keyword_score * 0.3 +
            experience_score * 0.1 +
            location_score * 0.1
        )

        return {
            'total_score': round(total_score, 2),
            'skills_score': round(skills_score, 2),
            'keyword_score': round(keyword_score, 2),
            'experience_score': round(experience_score, 2),
            'location_score': round(location_score, 2),
            'matched_skills': list(resume_skills & job_skills),
            'missing_skills': list(job_skills - resume_skills),
            'recommendation': self._get_recommendation(total_score)
        }

    def _normalize_skills(self, skills: List[str]) -> Set[str]:
        """
        Normalize skill names for matching.

        Args:
            skills: List of skill names

        Returns:
            Set of normalized skill names
        """
        normalized = set()
        for skill in skills:
            # Convert to lowercase and remove special chars
            skill_lower = skill.lower().strip()
            skill_normalized = re.sub(r'[^\w\s]', '', skill_lower)
            normalized.add(skill_normalized)

            # Also add original lowercase for exact matches
            normalized.add(skill_lower)

        return normalized

    def _extract_keywords(self, text: str) -> Set[str]:
        """
        Extract technical keywords from text.

        Args:
            text: Text to extract from

        Returns:
            Set of keywords
        """
        text_lower = text.lower()
        keywords = set()

        for keyword in self.tech_keywords:
            if keyword in text_lower:
                keywords.add(keyword)

        return keywords

    def _calculate_skills_match(
        self,
        resume_skills: Set[str],
        job_skills: Set[str],
        job_keywords: Set[str]
    ) -> float:
        """
        Calculate skills match score (0-100).

        Args:
            resume_skills: Resume skills
            job_skills: Job required skills
            job_keywords: Keywords from job description

        Returns:
            Score from 0-100
        """
        if not job_skills and not job_keywords:
            return 70.0  # Default score if no skills specified

        # Combine job skills and keywords
        all_job_requirements = job_skills | job_keywords

        if not all_job_requirements:
            return 70.0

        # Calculate overlap
        matched = resume_skills & all_job_requirements
        match_ratio = len(matched) / len(all_job_requirements)

        # Score with bonus for high match
        score = match_ratio * 100

        # Bonus if resume has extra relevant skills
        if len(resume_skills) > len(matched):
            bonus = min(10, (len(resume_skills) - len(matched)) * 2)
            score += bonus

        return min(100.0, score)

    def _calculate_keyword_match(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any]
    ) -> float:
        """
        Calculate keyword overlap in title and description.

        Args:
            resume_data: Resume data
            job_data: Job data

        Returns:
            Score from 0-100
        """
        # Extract resume text
        resume_text = ' '.join([
            resume_data.get('summary', ''),
            ' '.join([exp.get('description', '') for exp in resume_data.get('experience', [])])
        ]).lower()

        # Extract job text
        job_text = f"{job_data.get('title', '')} {job_data.get('description', '')}".lower()

        # Get keywords from both
        resume_keywords = self._extract_keywords(resume_text)
        job_keywords = self._extract_keywords(job_text)

        if not job_keywords:
            return 60.0  # Default score

        # Calculate overlap
        matched = resume_keywords & job_keywords
        match_ratio = len(matched) / len(job_keywords) if job_keywords else 0

        return match_ratio * 100

    def _calculate_experience_match(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any]
    ) -> float:
        """
        Calculate experience level match.

        Args:
            resume_data: Resume data
            job_data: Job data

        Returns:
            Score from 0-100
        """
        # Count years of experience from resume
        experience_entries = resume_data.get('experience', [])
        years_experience = len(experience_entries)  # Simplified: 1 year per job

        # Detect seniority level from job title
        job_title = job_data.get('title', '').lower()

        if 'senior' in job_title or 'lead' in job_title or 'principal' in job_title:
            required_years = 5
        elif 'mid' in job_title or 'intermediate' in job_title:
            required_years = 3
        elif 'junior' in job_title or 'entry' in job_title:
            required_years = 0
        else:
            required_years = 2  # Default

        # Calculate score based on experience gap
        if years_experience >= required_years:
            return 100.0
        elif years_experience >= required_years - 1:
            return 75.0
        elif years_experience >= required_years - 2:
            return 50.0
        else:
            return 25.0

    def _calculate_location_match(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any],
        preferences: Dict[str, Any]
    ) -> float:
        """
        Calculate location preference match.

        Args:
            resume_data: Resume data
            job_data: Job data
            preferences: User preferences

        Returns:
            Score from 0-100
        """
        job_location = job_data.get('location', '').lower()
        is_remote = job_data.get('remote', False) or 'remote' in job_location

        # Check user preferences
        preferred_locations = preferences.get('locations', [])
        remote_only = preferences.get('remote_only', False)

        # If remote and user wants remote
        if is_remote:
            if remote_only or not preferred_locations:
                return 100.0
            else:
                return 80.0  # Still good even if location specified

        # If not remote but user wants remote only
        if remote_only:
            return 0.0

        # Check if job location matches preferred locations
        if preferred_locations:
            for preferred in preferred_locations:
                if preferred.lower() in job_location:
                    return 100.0
            return 30.0  # Location doesn't match preference

        # No preference specified
        return 70.0

    def _get_recommendation(self, score: float) -> str:
        """
        Get recommendation based on match score.

        Args:
            score: Match score

        Returns:
            Recommendation text
        """
        if score >= 80:
            return 'Excellent match! Highly recommended to apply.'
        elif score >= 60:
            return 'Good match. Consider applying.'
        elif score >= 40:
            return 'Moderate match. Review requirements carefully.'
        else:
            return 'Low match. May need additional skills or experience.'

    def rank_jobs(
        self,
        resume_data: Dict[str, Any],
        jobs: List[Dict[str, Any]],
        preferences: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Rank a list of jobs by match score.

        Args:
            resume_data: Parsed resume data
            jobs: List of job listings
            preferences: User preferences

        Returns:
            Sorted list of jobs with match scores
        """
        scored_jobs = []

        for job in jobs:
            match_result = self.calculate_match_score(resume_data, job, preferences)
            job_with_score = {
                **job,
                'match_score': match_result['total_score'],
                'match_details': match_result
            }
            scored_jobs.append(job_with_score)

        # Sort by match score (descending)
        scored_jobs.sort(key=lambda x: x['match_score'], reverse=True)

        return scored_jobs

    def filter_jobs(
        self,
        jobs: List[Dict[str, Any]],
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Filter jobs based on criteria.

        Args:
            jobs: List of jobs
            filters: Filter criteria

        Returns:
            Filtered list of jobs
        """
        filtered = jobs

        # Filter by minimum match score
        if 'min_match_score' in filters:
            min_score = filters['min_match_score']
            filtered = [j for j in filtered if j.get('match_score', 0) >= min_score]

        # Filter by salary
        if 'min_salary' in filters:
            min_salary = filters['min_salary']
            filtered = [
                j for j in filtered
                if j.get('salary_min') and j['salary_min'] >= min_salary
            ]

        # Filter by remote
        if filters.get('remote_only'):
            filtered = [j for j in filtered if j.get('remote')]

        # Filter by location
        if 'locations' in filters and filters['locations']:
            locations = [loc.lower() for loc in filters['locations']]
            filtered = [
                j for j in filtered
                if any(loc in j.get('location', '').lower() for loc in locations)
                or j.get('remote')
            ]

        # Filter by required skills
        if 'required_skills' in filters and filters['required_skills']:
            required = set(skill.lower() for skill in filters['required_skills'])
            filtered = [
                j for j in filtered
                if required & set(skill.lower() for skill in j.get('required_skills', []))
            ]

        return filtered
