"""
API routes for application tracking and management.
Handles application CRUD, status updates, and analytics.
"""
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.database import Application, Job, Resume
from app.models.schemas import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    DashboardStats
)
from app.utils.database import get_db

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("/", response_model=ApplicationResponse, status_code=201)
def create_application(
    application: ApplicationCreate,
    user_id: int = 1,  # TODO: Get from auth
    db: Session = Depends(get_db)
):
    """
    Create a new job application.

    Args:
        application: Application data
        user_id: User ID
        db: Database session

    Returns:
        Created application
    """
    # Verify job exists
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Verify resume exists
    resume = db.query(Resume).filter(
        Resume.id == application.resume_id,
        Resume.user_id == user_id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Check for duplicate application
    existing = db.query(Application).filter(
        Application.user_id == user_id,
        Application.job_id == application.job_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Application already exists for this job"
        )

    # Create application
    db_application = Application(
        user_id=user_id,
        job_id=application.job_id,
        resume_id=application.resume_id,
        notes=application.notes,
        cover_letter=application.cover_letter,
        status="applied"
    )

    db.add(db_application)
    db.commit()
    db.refresh(db_application)

    return db_application


@router.get("/", response_model=List[ApplicationResponse])
def get_applications(
    user_id: int = 1,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all applications for a user.

    Args:
        user_id: User ID
        status: Filter by status (applied, viewed, interview, rejected, offer)
        skip: Number to skip
        limit: Maximum to return
        db: Database session

    Returns:
        List of applications
    """
    query = db.query(Application).filter(Application.user_id == user_id)

    if status:
        query = query.filter(Application.status == status)

    applications = query.order_by(desc(Application.applied_date)).offset(skip).limit(limit).all()
    return applications


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """
    Get a specific application.

    Args:
        application_id: Application ID
        user_id: User ID
        db: Database session

    Returns:
        Application data
    """
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == user_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    return application


@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    application_update: ApplicationUpdate,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """
    Update application status and details.

    Args:
        application_id: Application ID
        application_update: Updated fields
        user_id: User ID
        db: Database session

    Returns:
        Updated application
    """
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == user_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Update fields
    update_data = application_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)

    application.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(application)

    return application


@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """
    Delete an application.

    Args:
        application_id: Application ID
        user_id: User ID
        db: Database session

    Returns:
        Success message
    """
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == user_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)
    db.commit()

    return {'message': 'Application deleted successfully'}


@router.get("/stats/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics for user.

    Args:
        user_id: User ID
        db: Database session

    Returns:
        Dashboard statistics
    """
    # Total applications
    total_applications = db.query(Application).filter(
        Application.user_id == user_id
    ).count()

    # Applications today
    today = datetime.utcnow().date()
    applications_today = db.query(Application).filter(
        Application.user_id == user_id,
        func.date(Application.applied_date) == today
    ).count()

    # Active jobs (with match score > 60)
    active_jobs = db.query(Job).filter(
        Job.is_active == True,
        Job.match_score >= 60
    ).count()

    # Interviews scheduled
    interviews_scheduled = db.query(Application).filter(
        Application.user_id == user_id,
        Application.status == 'interview',
        Application.interview_date.isnot(None)
    ).count()

    # Applications by status
    status_counts = db.query(
        Application.status,
        func.count(Application.id)
    ).filter(
        Application.user_id == user_id
    ).group_by(Application.status).all()

    applications_by_status = {status: count for status, count in status_counts}

    # Calculate response rate
    total_with_response = db.query(Application).filter(
        Application.user_id == user_id,
        Application.response_date.isnot(None)
    ).count()
    response_rate = (total_with_response / total_applications * 100) if total_applications > 0 else 0

    # Recent applications (last 5)
    recent_applications = db.query(Application).filter(
        Application.user_id == user_id
    ).order_by(desc(Application.applied_date)).limit(5).all()

    return DashboardStats(
        applications_today=applications_today,
        total_applications=total_applications,
        response_rate=round(response_rate, 2),
        active_jobs=active_jobs,
        interviews_scheduled=interviews_scheduled,
        applications_by_status=applications_by_status,
        recent_applications=recent_applications
    )


@router.get("/analytics/trends")
def get_application_trends(
    user_id: int = 1,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get application trends over time.

    Args:
        user_id: User ID
        days: Number of days to analyze
        db: Database session

    Returns:
        Trend data
    """
    start_date = datetime.utcnow() - timedelta(days=days)

    # Applications per day
    daily_apps = db.query(
        func.date(Application.applied_date).label('date'),
        func.count(Application.id).label('count')
    ).filter(
        Application.user_id == user_id,
        Application.applied_date >= start_date
    ).group_by(func.date(Application.applied_date)).all()

    # Response rate by week
    weekly_response = db.query(
        func.strftime('%Y-%W', Application.applied_date).label('week'),
        func.count(Application.id).label('total'),
        func.sum(func.case((Application.response_date.isnot(None), 1), else_=0)).label('responded')
    ).filter(
        Application.user_id == user_id,
        Application.applied_date >= start_date
    ).group_by(func.strftime('%Y-%W', Application.applied_date)).all()

    # Success rate by status
    status_distribution = db.query(
        Application.status,
        func.count(Application.id)
    ).filter(
        Application.user_id == user_id,
        Application.applied_date >= start_date
    ).group_by(Application.status).all()

    return {
        'daily_applications': [
            {'date': str(date), 'count': count}
            for date, count in daily_apps
        ],
        'weekly_response_rate': [
            {
                'week': week,
                'total': total,
                'responded': responded,
                'rate': round((responded / total * 100) if total > 0 else 0, 2)
            }
            for week, total, responded in weekly_response
        ],
        'status_distribution': dict(status_distribution)
    }


@router.post("/bulk-apply")
def bulk_apply(
    job_ids: List[int],
    resume_id: int,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """
    Create applications for multiple jobs at once.

    Args:
        job_ids: List of job IDs to apply to
        resume_id: Resume ID to use
        user_id: User ID
        db: Database session

    Returns:
        Summary of created applications
    """
    # Verify resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user_id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    created = 0
    skipped = 0
    errors = []

    for job_id in job_ids:
        try:
            # Check if job exists
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                errors.append(f"Job {job_id} not found")
                continue

            # Check for duplicate
            existing = db.query(Application).filter(
                Application.user_id == user_id,
                Application.job_id == job_id
            ).first()
            if existing:
                skipped += 1
                continue

            # Create application
            db_application = Application(
                user_id=user_id,
                job_id=job_id,
                resume_id=resume_id,
                status="applied"
            )
            db.add(db_application)
            created += 1

        except Exception as e:
            errors.append(f"Job {job_id}: {str(e)}")

    db.commit()

    return {
        'created': created,
        'skipped': skipped,
        'total_requested': len(job_ids),
        'errors': errors
    }
