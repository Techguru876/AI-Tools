"""
Unit tests for resume parser service.
Tests PDF/DOCX parsing, data extraction, and ATS scoring.
"""
import pytest
import os
from pathlib import Path
from app.services.resume_parser import ResumeParser


class TestResumeParser:
    """Test suite for ResumeParser class."""

    @pytest.fixture
    def parser(self):
        """Create ResumeParser instance for tests."""
        return ResumeParser()

    @pytest.fixture
    def test_data_dir(self):
        """Get test data directory path."""
        return Path(__file__).parent / 'test_data'

    def test_parser_initialization(self, parser):
        """Test that parser initializes correctly."""
        assert parser is not None
        assert isinstance(parser.TECH_SKILLS, list)
        assert len(parser.TECH_SKILLS) > 0

    def test_extract_email_valid(self, parser):
        """Test email extraction with valid email."""
        text = "Contact me at john.doe@example.com for more info"
        email = parser._extract_email(text)
        assert email == "john.doe@example.com"

    def test_extract_email_multiple(self, parser):
        """Test email extraction when multiple emails present."""
        text = "Email: first@example.com or second@test.org"
        email = parser._extract_email(text)
        assert email in ["first@example.com", "second@test.org"]

    def test_extract_email_none(self, parser):
        """Test email extraction when no email present."""
        text = "No email address in this text"
        email = parser._extract_email(text)
        assert email is None

    def test_extract_phone_valid(self, parser):
        """Test phone number extraction with valid formats."""
        test_cases = [
            ("Call me at (555) 123-4567", "(555) 123-4567"),
            ("Phone: 555-123-4567", "(555) 123-4567"),
            ("Contact: 5551234567", "(555) 123-4567"),
        ]

        for text, expected in test_cases:
            phone = parser._extract_phone(text)
            assert phone == expected

    def test_extract_phone_none(self, parser):
        """Test phone extraction when no phone present."""
        text = "No phone number here"
        phone = parser._extract_phone(text)
        assert phone is None

    def test_extract_skills(self, parser):
        """Test skill extraction from text."""
        text = """
        Skills: Python, JavaScript, React, Node.js, Docker, AWS
        I have experience with FastAPI and PostgreSQL databases.
        """
        skills = parser._extract_skills(text)

        assert isinstance(skills, list)
        assert len(skills) > 0
        # Check for some expected skills (case-insensitive)
        skills_lower = [s.lower() for s in skills]
        assert 'python' in skills_lower
        assert 'javascript' in skills_lower
        assert any('react' in s.lower() for s in skills)

    def test_extract_skills_no_duplicates(self, parser):
        """Test that skill extraction removes duplicates."""
        text = "Python Python PYTHON python React react REACT"
        skills = parser._extract_skills(text)

        # Convert to lowercase for comparison
        skills_lower = [s.lower() for s in skills]
        assert len(skills_lower) == len(set(skills_lower))

    def test_find_section_experience(self, parser):
        """Test finding experience section."""
        text = """
        Summary
        I am a developer

        Work Experience
        Software Engineer at ABC Corp
        Developed applications

        Education
        BS in Computer Science
        """
        section = parser._find_section(text, 'experience')
        assert section is not None
        assert 'Software Engineer' in section
        assert 'Education' not in section

    def test_find_section_skills(self, parser):
        """Test finding skills section."""
        text = """
        Professional Summary
        Experienced developer

        Skills
        Python, JavaScript, React

        Experience
        Software Engineer
        """
        section = parser._find_section(text, 'skills')
        assert section is not None
        assert 'Python' in section or 'JavaScript' in section

    def test_calculate_ats_score_complete(self, parser):
        """Test ATS score calculation with complete resume data."""
        complete_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone': '(555) 123-4567',
            'skills': ['Python', 'JavaScript', 'React', 'AWS', 'Docker'],
            'experience': [
                {'title': 'Senior Engineer', 'company': 'ABC Corp'},
                {'title': 'Developer', 'company': 'XYZ Inc'}
            ],
            'education': [
                {'degree': 'BS Computer Science', 'institution': 'University'}
            ],
            'summary': 'Experienced software engineer with strong technical skills'
        }

        score = parser.calculate_ats_score(complete_data)
        assert 70 <= score <= 100  # Should be high score

    def test_calculate_ats_score_minimal(self, parser):
        """Test ATS score calculation with minimal resume data."""
        minimal_data = {
            'name': 'Jane Doe',
            'email': None,
            'phone': None,
            'skills': [],
            'experience': [],
            'education': [],
        }

        score = parser.calculate_ats_score(minimal_data)
        assert 0 <= score <= 30  # Should be low score

    def test_calculate_ats_score_no_contact(self, parser):
        """Test ATS score when contact info is missing."""
        data = {
            'name': None,
            'email': None,
            'phone': None,
            'skills': ['Python', 'JavaScript'],
            'experience': [{'title': 'Developer'}],
            'education': [{'degree': 'BS CS'}],
        }

        score = parser.calculate_ats_score(data)
        assert score < 80  # Lower score without contact info

    def test_parse_text_content_structure(self, parser):
        """Test that parse_text_content returns correct structure."""
        sample_text = """
        John Smith
        john.smith@email.com | (555) 123-4567

        Summary
        Experienced developer

        Skills
        Python, JavaScript, React

        Experience
        Senior Engineer
        Tech Corp | 2020-2023
        Developed applications

        Education
        BS Computer Science
        University of Tech | 2019
        """

        result = parser._parse_text_content(sample_text)

        # Check structure
        assert isinstance(result, dict)
        assert 'name' in result
        assert 'email' in result
        assert 'phone' in result
        assert 'skills' in result
        assert 'experience' in result
        assert 'education' in result
        assert isinstance(result['skills'], list)
        assert isinstance(result['experience'], list)
        assert isinstance(result['education'], list)

    def test_extract_name_from_lines(self, parser):
        """Test name extraction from resume lines."""
        lines = [
            "John Smith",
            "john.smith@email.com",
            "(555) 123-4567"
        ]

        name = parser._extract_name(lines)
        assert name == "John Smith"

    def test_extract_name_skips_email(self, parser):
        """Test that name extraction skips email lines."""
        lines = [
            "john.smith@email.com",
            "John Smith",
            "Software Engineer"
        ]

        name = parser._extract_name(lines)
        assert name == "John Smith"

    @pytest.mark.skipif(
        not Path(__file__).parent.joinpath('test_data', 'test_resume.pdf').exists(),
        reason="Test PDF file not found. Run generate_test_files.py first."
    )
    def test_parse_pdf_file(self, parser, test_data_dir):
        """Test parsing actual PDF file."""
        pdf_path = test_data_dir / 'test_resume.pdf'
        raw_text, parsed_data = parser.parse_resume(str(pdf_path), 'pdf')

        assert raw_text is not None
        assert len(raw_text) > 0
        assert isinstance(parsed_data, dict)
        assert parsed_data.get('email') is not None

    @pytest.mark.skipif(
        not Path(__file__).parent.joinpath('test_data', 'test_resume.docx').exists(),
        reason="Test DOCX file not found. Run generate_test_files.py first."
    )
    def test_parse_docx_file(self, parser, test_data_dir):
        """Test parsing actual DOCX file."""
        docx_path = test_data_dir / 'test_resume.docx'
        raw_text, parsed_data = parser.parse_resume(str(docx_path), 'docx')

        assert raw_text is not None
        assert len(raw_text) > 0
        assert isinstance(parsed_data, dict)
        assert parsed_data.get('email') is not None

    def test_parse_resume_invalid_file_type(self, parser):
        """Test that invalid file type raises error."""
        with pytest.raises(ValueError, match="Unsupported file type"):
            parser.parse_resume('/fake/path/resume.txt', 'txt')

    def test_parse_resume_file_not_found(self, parser):
        """Test that missing file raises error."""
        with pytest.raises(FileNotFoundError):
            parser.parse_resume('/nonexistent/file.pdf', 'pdf')


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
