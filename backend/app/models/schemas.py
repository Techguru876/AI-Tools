"""
Pydantic schemas for request/response validation.
Ensures type safety and automatic API documentation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field


# ============================================================================
# Resume Schemas
# ============================================================================

class ParsedResumeData(BaseModel):
    """Structured data extracted from resume."""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)


class ResumeCreate(BaseModel):
    """Schema for creating a new resume."""
    title: str = Field(..., min_length=1, max_length=200)
    tags: List[str] = Field(default_factory=list)


class ResumeResponse(BaseModel):
    """Response schema for resume data."""
    id: int
    user_id: int
    title: str
    file_name: str
    file_type: str
    parsed_data_json: Dict[str, Any]
    version: int
    tags: List[str]
    ats_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumeUpdate(BaseModel):
    """Schema for updating resume data."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    tags: Optional[List[str]] = None
    parsed_data_json: Optional[Dict[str, Any]] = None


# ============================================================================
# Job Schemas
# ============================================================================

class JobBase(BaseModel):
    """Base schema for job data."""
    title: str
    company: str
    description: str
    url: str
    salary_range: Optional[str] = None
    location: Optional[str] = None
    remote: bool = False
    job_type: Optional[str] = None


class JobCreate(JobBase):
    """Schema for creating a new job listing."""
    required_skills: List[str] = Field(default_factory=list)
    job_board: Optional[str] = None


class JobResponse(JobBase):
    """Response schema for job data."""
    id: int
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    required_skills: List[str]
    scraped_date: datetime
    match_score: float
    job_board: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


# ============================================================================
# Application Schemas
# ============================================================================

class ApplicationCreate(BaseModel):
    """Schema for creating a new application."""
    job_id: int
    resume_id: int
    notes: Optional[str] = None
    cover_letter: Optional[str] = None


class ApplicationUpdate(BaseModel):
    """Schema for updating application status."""
    status: Optional[str] = Field(None, pattern="^(applied|viewed|interview|rejected|offer)$")
    notes: Optional[str] = None
    response_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None


class ApplicationResponse(BaseModel):
    """Response schema for application data."""
    id: int
    user_id: int
    job_id: int
    resume_id: int
    applied_date: datetime
    status: str
    notes: Optional[str] = None
    cover_letter: Optional[str] = None
    response_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# User Schemas
# ============================================================================

class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Response schema for user data."""
    id: int
    email: str
    full_name: Optional[str] = None
    preferences_json: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


# ============================================================================
# Analytics Schemas
# ============================================================================

class DashboardStats(BaseModel):
    """Schema for dashboard statistics."""
    applications_today: int
    total_applications: int
    response_rate: float
    active_jobs: int
    interviews_scheduled: int
    applications_by_status: Dict[str, int]
    recent_applications: List[ApplicationResponse]


# ============================================================================
# General Response Schemas
# ============================================================================

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response schema."""
    error: str
    detail: Optional[str] = None
    success: bool = False
