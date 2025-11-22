"""
API routes for resume management.
Handles upload, parsing, retrieval, update, and deletion of resumes.
"""
import os
import shutil
from datetime import datetime
from typing import List
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session

from app.models.database import Resume
from app.models.schemas import ResumeResponse, ResumeCreate, ResumeUpdate, MessageResponse
from app.utils.database import get_db
from app.utils.validation import FileValidator
from app.services.resume_parser import ResumeParser

router = APIRouter(prefix="/resumes", tags=["resumes"])

# Directory for storing uploaded resumes
UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    title: str = Form(...),
    tags: str = Form("[]"),  # JSON string of tags
    user_id: int = Form(1),  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Upload and parse a resume file.

    Steps:
    1. Validate file (type, size)
    2. Save file to disk
    3. Parse resume content
    4. Calculate ATS score
    5. Store in database

    Args:
        file: Resume file (PDF or DOCX)
        title: Resume title/version name
        tags: JSON string of tags (e.g., '["technical", "management"]')
        user_id: User ID (from authentication)
        db: Database session

    Returns:
        Created resume with parsed data
    """
    try:
        # Validate file
        file_extension = FileValidator.validate_resume_file(file)
        file_type = file_extension[0].replace('.', '')

        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = FileValidator.sanitize_filename(file.filename)
        unique_filename = f"{user_id}_{timestamp}_{safe_filename}"
        file_path = UPLOAD_DIR / unique_filename

        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Parse resume
        parser = ResumeParser()
        try:
            raw_text, parsed_data = parser.parse_resume(str(file_path), file_type)
            ats_score = parser.calculate_ats_score(parsed_data)
        except Exception as parse_error:
            # Clean up file if parsing fails
            if file_path.exists():
                os.remove(file_path)
            raise HTTPException(
                status_code=422,
                detail=f"Failed to parse resume: {str(parse_error)}"
            )

        # Parse tags from JSON string
        import json
        try:
            tags_list = json.loads(tags)
        except json.JSONDecodeError:
            tags_list = []

        # Create database entry
        db_resume = Resume(
            user_id=user_id,
            title=title,
            file_name=safe_filename,
            file_path=str(file_path),
            file_type=file_type,
            content=raw_text,
            parsed_data_json=parsed_data,
            tags=tags_list,
            ats_score=ats_score,
            version=1
        )

        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)

        return db_resume

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.get("/", response_model=List[ResumeResponse])
def get_resumes(
    user_id: int = 1,  # TODO: Get from auth token
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all resumes for a user.

    Args:
        user_id: User ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of resumes
    """
    resumes = db.query(Resume).filter(
        Resume.user_id == user_id
    ).offset(skip).limit(limit).all()

    return resumes


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Get a specific resume by ID.

    Args:
        resume_id: Resume ID
        user_id: User ID
        db: Database session

    Returns:
        Resume data

    Raises:
        HTTPException: If resume not found or unauthorized
    """
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user_id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    return resume


@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: int,
    resume_update: ResumeUpdate,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Update resume metadata (title, tags, parsed data).

    Args:
        resume_id: Resume ID
        resume_update: Updated fields
        user_id: User ID
        db: Database session

    Returns:
        Updated resume

    Raises:
        HTTPException: If resume not found
    """
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user_id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Update fields
    update_data = resume_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resume, field, value)

    resume.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(resume)

    return resume


@router.delete("/{resume_id}", response_model=MessageResponse)
def delete_resume(
    resume_id: int,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Delete a resume.

    Args:
        resume_id: Resume ID
        user_id: User ID
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If resume not found
    """
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user_id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Delete file from disk
    file_path = Path(resume.file_path)
    if file_path.exists():
        try:
            os.remove(file_path)
        except Exception as e:
            # Log error but continue with database deletion
            print(f"Warning: Could not delete file {file_path}: {str(e)}")

    # Delete from database
    db.delete(resume)
    db.commit()

    return MessageResponse(
        message=f"Resume '{resume.title}' deleted successfully",
        success=True
    )


@router.post("/{resume_id}/reparse", response_model=ResumeResponse)
def reparse_resume(
    resume_id: int,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Re-parse an existing resume file.

    Useful if parsing logic has been improved.

    Args:
        resume_id: Resume ID
        user_id: User ID
        db: Database session

    Returns:
        Updated resume with new parsed data

    Raises:
        HTTPException: If resume not found or file missing
    """
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user_id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    file_path = Path(resume.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Resume file not found on disk")

    # Re-parse
    parser = ResumeParser()
    try:
        raw_text, parsed_data = parser.parse_resume(str(file_path), resume.file_type)
        ats_score = parser.calculate_ats_score(parsed_data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to re-parse resume: {str(e)}")

    # Update database
    resume.content = raw_text
    resume.parsed_data_json = parsed_data
    resume.ats_score = ats_score
    resume.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(resume)

    return resume
