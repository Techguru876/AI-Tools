"""
Database models for the job application system.
Uses SQLAlchemy ORM with SQLite (PostgreSQL migration ready).
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Boolean, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    """User model for authentication and profile management."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    preferences_json = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    """Resume model for storing uploaded and parsed resume data."""
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf or docx
    content = Column(Text, nullable=True)  # Raw text content
    parsed_data_json = Column(JSON, default={})  # Structured parsed data
    version = Column(Integer, default=1)
    tags = Column(JSON, default=[])  # e.g., ["technical", "management"]
    ats_score = Column(Float, default=0.0)  # ATS optimization score
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")
    applications = relationship("Application", back_populates="resume")


class Job(Base):
    """Job model for storing scraped job listings."""
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    url = Column(String, nullable=False)
    salary_range = Column(String, nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    location = Column(String, nullable=True, index=True)
    remote = Column(Boolean, default=False, index=True)
    job_type = Column(String, nullable=True)  # full-time, part-time, contract
    required_skills = Column(JSON, default=[])
    scraped_date = Column(DateTime, default=datetime.utcnow)
    match_score = Column(Float, default=0.0, index=True)
    job_board = Column(String, nullable=True)  # Indeed, LinkedIn, etc.
    is_active = Column(Boolean, default=True, index=True)

    # Relationships
    applications = relationship("Application", back_populates="job")


class Application(Base):
    """Application model for tracking job applications."""
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    applied_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="applied", index=True)  # applied, viewed, interview, rejected, offer
    notes = Column(Text, nullable=True)
    cover_letter = Column(Text, nullable=True)
    tailored_resume_path = Column(String, nullable=True)
    response_date = Column(DateTime, nullable=True)
    interview_date = Column(DateTime, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    resume = relationship("Resume", back_populates="applications")


class JobBoard(Base):
    """Job board credentials and configuration."""
    __tablename__ = "job_boards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)  # Indeed, LinkedIn, etc.
    credentials_encrypted = Column(Text, nullable=True)
    last_scraped = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    scraping_config = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
