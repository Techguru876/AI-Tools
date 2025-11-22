"""
API routes for job discovery and management.
Handles job scraping, matching, filtering, and CRUD operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.models.database import Job, Resume
from app.models.schemas import JobCreate, JobResponse
from app.utils.database import get_db
from app.services.job_scraper import JobScraper
from app.services.job_matcher import JobMatcher

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/scrape", response_model=dict)
async def scrape_jobs(
    query: str = Query(..., description="Search query"),
    location: str = Query("", description="Location filter"),
    max_results: int = Query(20, ge=1, le=100),
    use_mock: bool = Query(True, description="Use mock data for testing"),
    user_id: int = 1,  # TODO: Get from auth
    db: Session = Depends(get_db)
):
    """
    Scrape jobs from job boards and save to database.

    Args:
        query: Job search query
        location: Location filter
        max_results: Maximum results to scrape
        use_mock: Use mock data instead of real scraping
        user_id: User ID
        db: Database session

    Returns:
        Summary of scraped jobs
    """
    try:
        # Get user's resume for matching
        resume = db.query(Resume).filter(Resume.user_id == user_id).first()

        if use_mock:
            # Use mock data for testing
            scraper = JobScraper()
            jobs_data = scraper.create_mock_jobs(count=max_results)
        else:
            # Real scraping (requires Playwright installed)
            async with JobScraper() as scraper:
                jobs_data = await scraper.scrape_indeed(query, location, max_results)

        # Match jobs with resume if available
        matcher = JobMatcher()
        saved_count = 0

        for job_data in jobs_data:
            # Calculate match score if resume exists
            match_score = 0.0
            if resume and resume.parsed_data_json:
                match_result = matcher.calculate_match_score(
                    resume.parsed_data_json,
                    job_data
                )
                match_score = match_result['total_score']

            # Check if job already exists
            existing = db.query(Job).filter(
                Job.url == job_data['url'],
                Job.title == job_data['title'],
                Job.company == job_data['company']
            ).first()

            if existing:
                # Update existing job
                existing.match_score = match_score
                existing.is_active = True
                existing.scraped_date = job_data['scraped_date']
            else:
                # Create new job
                db_job = Job(
                    title=job_data['title'],
                    company=job_data['company'],
                    description=job_data.get('description', ''),
                    url=job_data['url'],
                    salary_range=job_data.get('salary_range'),
                    salary_min=job_data.get('salary_min'),
                    salary_max=job_data.get('salary_max'),
                    location=job_data.get('location', ''),
                    remote=job_data.get('remote', False),
                    job_type=job_data.get('job_type'),
                    required_skills=job_data.get('required_skills', []),
                    scraped_date=job_data['scraped_date'],
                    match_score=match_score,
                    job_board=job_data.get('job_board', 'Unknown'),
                    is_active=True
                )
                db.add(db_job)
                saved_count += 1

        db.commit()

        return {
            'message': f'Successfully scraped {len(jobs_data)} jobs',
            'saved': saved_count,
            'total_found': len(jobs_data),
            'source': 'mock' if use_mock else 'real'
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@router.get("/", response_model=List[JobResponse])
def get_jobs(
    skip: int = 0,
    limit: int = 50,
    min_match_score: Optional[float] = None,
    remote_only: bool = False,
    location: Optional[str] = None,
    min_salary: Optional[int] = None,
    sort_by: str = "match_score",
    db: Session = Depends(get_db)
):
    """
    Get jobs with filtering and sorting.

    Args:
        skip: Number of records to skip
        limit: Maximum records to return
        min_match_score: Minimum match score filter
        remote_only: Filter for remote jobs only
        location: Location filter
        min_salary: Minimum salary filter
        sort_by: Sort field (match_score, scraped_date, salary_max)
        db: Database session

    Returns:
        List of jobs
    """
    query = db.query(Job).filter(Job.is_active == True)

    # Apply filters
    if min_match_score is not None:
        query = query.filter(Job.match_score >= min_match_score)

    if remote_only:
        query = query.filter(Job.remote == True)

    if location:
        query = query.filter(Job.location.ilike(f'%{location}%'))

    if min_salary:
        query = query.filter(Job.salary_min >= min_salary)

    # Apply sorting
    if sort_by == "match_score":
        query = query.order_by(desc(Job.match_score))
    elif sort_by == "scraped_date":
        query = query.order_by(desc(Job.scraped_date))
    elif sort_by == "salary_max":
        query = query.order_by(desc(Job.salary_max))

    jobs = query.offset(skip).limit(limit).all()
    return jobs


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """
    Get a specific job by ID.

    Args:
        job_id: Job ID
        db: Database session

    Returns:
        Job data
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/search", response_model=List[JobResponse])
def search_jobs(
    q: str = Query(..., description="Search query"),
    db: Session = Depends(get_db)
):
    """
    Search jobs by title, company, or description.

    Args:
        q: Search query
        db: Database session

    Returns:
        Matching jobs
    """
    search_term = f"%{q}%"
    jobs = db.query(Job).filter(
        or_(
            Job.title.ilike(search_term),
            Job.company.ilike(search_term),
            Job.description.ilike(search_term)
        )
    ).order_by(desc(Job.match_score)).limit(50).all()

    return jobs


@router.post("/{job_id}/calculate-match", response_model=dict)
def calculate_job_match(
    job_id: int,
    resume_id: int,
    db: Session = Depends(get_db)
):
    """
    Calculate match score between a specific job and resume.

    Args:
        job_id: Job ID
        resume_id: Resume ID
        db: Database session

    Returns:
        Match score and details
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Prepare job data
    job_data = {
        'title': job.title,
        'description': job.description,
        'required_skills': job.required_skills,
        'location': job.location,
        'remote': job.remote
    }

    # Calculate match
    matcher = JobMatcher()
    match_result = matcher.calculate_match_score(
        resume.parsed_data_json,
        job_data
    )

    # Update job match score
    job.match_score = match_result['total_score']
    db.commit()

    return {
        'job_id': job_id,
        'resume_id': resume_id,
        **match_result
    }


@router.post("/recalculate-all-matches", response_model=dict)
def recalculate_all_matches(
    resume_id: int,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """
    Recalculate match scores for all jobs against a specific resume.

    Args:
        resume_id: Resume ID to use for matching
        user_id: User ID
        db: Database session

    Returns:
        Summary of recalculation
    """
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user_id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    jobs = db.query(Job).filter(Job.is_active == True).all()
    matcher = JobMatcher()
    updated_count = 0

    for job in jobs:
        job_data = {
            'title': job.title,
            'description': job.description,
            'required_skills': job.required_skills,
            'location': job.location,
            'remote': job.remote
        }

        match_result = matcher.calculate_match_score(
            resume.parsed_data_json,
            job_data
        )

        job.match_score = match_result['total_score']
        updated_count += 1

    db.commit()

    return {
        'message': f'Recalculated matches for {updated_count} jobs',
        'resume_id': resume_id,
        'jobs_updated': updated_count
    }


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    """
    Soft delete a job (mark as inactive).

    Args:
        job_id: Job ID
        db: Database session

    Returns:
        Success message
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.is_active = False
    db.commit()

    return {'message': 'Job deactivated successfully'}
