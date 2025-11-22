"""
Validation utilities for file uploads and data processing.
"""
import os
from typing import Tuple
from fastapi import UploadFile, HTTPException


class FileValidator:
    """Validates uploaded files for security and compatibility."""

    ALLOWED_EXTENSIONS = {'.pdf', '.docx'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    @classmethod
    def validate_resume_file(cls, file: UploadFile) -> Tuple[str, str]:
        """
        Validate uploaded resume file.

        Args:
            file: FastAPI UploadFile object

        Returns:
            Tuple of (file_extension, error_message)

        Raises:
            HTTPException: If file is invalid
        """
        # Check if file is provided
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")

        # Get file extension
        file_extension = os.path.splitext(file.filename)[1].lower()

        # Validate extension
        if file_extension not in cls.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(cls.ALLOWED_EXTENSIONS)}"
            )

        # Validate file size (read in chunks to avoid memory issues)
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning

        if file_size > cls.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {cls.MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        if file_size == 0:
            raise HTTPException(status_code=400, detail="Empty file")

        return file_extension, ""

    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """
        Sanitize filename to prevent path traversal attacks.

        Args:
            filename: Original filename

        Returns:
            Sanitized filename
        """
        # Remove path components
        filename = os.path.basename(filename)

        # Remove or replace dangerous characters
        dangerous_chars = ['..', '/', '\\', '\0']
        for char in dangerous_chars:
            filename = filename.replace(char, '_')

        # Ensure filename is not empty
        if not filename:
            filename = "resume"

        return filename
