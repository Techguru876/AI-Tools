"""
Resume parser service for extracting structured data from PDF and DOCX files.
Uses PyPDF2 for PDF parsing and python-docx for DOCX parsing.
Implements pattern matching and NLP techniques for data extraction.
"""
import re
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import PyPDF2
from docx import Document


class ResumeParser:
    """
    Parses resumes in PDF or DOCX format and extracts structured data.

    Extracts:
    - Contact information (name, email, phone)
    - Skills
    - Work experience
    - Education
    - Certifications
    """

    # Common section headers (case-insensitive patterns)
    SECTION_PATTERNS = {
        'experience': r'(work\s+experience|experience|employment\s+history|professional\s+experience)',
        'education': r'(education|academic\s+background|qualifications)',
        'skills': r'(skills|technical\s+skills|core\s+competencies|expertise)',
        'certifications': r'(certifications?|licenses?|credentials)',
        'summary': r'(summary|profile|objective|about\s+me)',
    }

    # Email pattern
    EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'

    # Phone pattern (supports various formats)
    PHONE_PATTERN = r'(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'

    # Common skills keywords
    TECH_SKILLS = [
        'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
        'node.js', 'express', 'django', 'flask', 'fastapi', 'sql', 'postgresql',
        'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
        'git', 'ci/cd', 'agile', 'scrum', 'html', 'css', 'tailwind', 'bootstrap',
        'rest api', 'graphql', 'microservices', 'machine learning', 'ai',
        'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn'
    ]

    def __init__(self):
        """Initialize the resume parser."""
        pass

    def parse_resume(self, file_path: str, file_type: str) -> Tuple[str, Dict[str, Any]]:
        """
        Main method to parse a resume file.

        Args:
            file_path: Path to the resume file
            file_type: File type ('pdf' or 'docx')

        Returns:
            Tuple of (raw_text, parsed_data_dict)

        Raises:
            ValueError: If file type is not supported
            FileNotFoundError: If file does not exist
        """
        if not Path(file_path).exists():
            raise FileNotFoundError(f"Resume file not found: {file_path}")

        # Extract raw text based on file type
        if file_type.lower() == 'pdf':
            raw_text = self._extract_text_from_pdf(file_path)
        elif file_type.lower() == 'docx':
            raw_text = self._extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

        # Parse structured data from raw text
        parsed_data = self._parse_text_content(raw_text)

        return raw_text, parsed_data

    def _extract_text_from_pdf(self, file_path: str) -> str:
        """
        Extract text content from a PDF file.

        Args:
            file_path: Path to PDF file

        Returns:
            Extracted text as string
        """
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            raise ValueError(f"Error reading PDF file: {str(e)}")

        return text.strip()

    def _extract_text_from_docx(self, file_path: str) -> str:
        """
        Extract text content from a DOCX file.

        Args:
            file_path: Path to DOCX file

        Returns:
            Extracted text as string
        """
        text = ""
        try:
            doc = Document(file_path)
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text += paragraph.text + "\n"
        except Exception as e:
            raise ValueError(f"Error reading DOCX file: {str(e)}")

        return text.strip()

    def _parse_text_content(self, text: str) -> Dict[str, Any]:
        """
        Parse structured data from raw text content.

        Args:
            text: Raw text from resume

        Returns:
            Dictionary containing parsed structured data
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        parsed_data = {
            'name': self._extract_name(lines),
            'email': self._extract_email(text),
            'phone': self._extract_phone(text),
            'location': self._extract_location(lines),
            'summary': self._extract_summary(text),
            'skills': self._extract_skills(text),
            'experience': self._extract_experience(text),
            'education': self._extract_education(text),
            'certifications': self._extract_certifications(text),
            'languages': []
        }

        return parsed_data

    def _extract_name(self, lines: List[str]) -> Optional[str]:
        """
        Extract candidate name (usually first non-empty line).

        Args:
            lines: List of text lines

        Returns:
            Extracted name or None
        """
        if not lines:
            return None

        # Name is typically in the first few lines
        # Skip lines that look like contact info or section headers
        for line in lines[:5]:
            # Skip if it's an email or phone number
            if '@' in line or re.search(self.PHONE_PATTERN, line):
                continue
            # Skip if it's all caps and looks like a header
            if line.isupper() and len(line) > 20:
                continue
            # Check if it looks like a name (2-4 words, capitalized)
            words = line.split()
            if 2 <= len(words) <= 4 and all(word[0].isupper() for word in words if word):
                return line

        return lines[0] if lines else None

    def _extract_email(self, text: str) -> Optional[str]:
        """Extract email address from text."""
        match = re.search(self.EMAIL_PATTERN, text)
        return match.group(0) if match else None

    def _extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number from text."""
        match = re.search(self.PHONE_PATTERN, text)
        if match:
            return f"({match.group(1)}) {match.group(2)}-{match.group(3)}"
        return None

    def _extract_location(self, lines: List[str]) -> Optional[str]:
        """
        Extract location from resume (usually near contact info).

        Args:
            lines: List of text lines

        Returns:
            Extracted location or None
        """
        # Common location patterns
        location_pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})\b'

        # Check first 10 lines for location
        for line in lines[:10]:
            match = re.search(location_pattern, line)
            if match:
                return match.group(1)

        return None

    def _find_section(self, text: str, section_name: str) -> Optional[str]:
        """
        Find and extract content of a specific section.

        Args:
            text: Full resume text
            section_name: Name of section to find

        Returns:
            Section content or None
        """
        pattern = self.SECTION_PATTERNS.get(section_name)
        if not pattern:
            return None

        # Find section start
        section_match = re.search(pattern, text, re.IGNORECASE)
        if not section_match:
            return None

        start_pos = section_match.end()

        # Find next section or end of document
        next_section_pos = len(text)
        for other_pattern in self.SECTION_PATTERNS.values():
            match = re.search(other_pattern, text[start_pos:], re.IGNORECASE)
            if match and match.start() < next_section_pos - start_pos:
                next_section_pos = start_pos + match.start()

        return text[start_pos:next_section_pos].strip()

    def _extract_summary(self, text: str) -> Optional[str]:
        """Extract professional summary/objective."""
        summary_section = self._find_section(text, 'summary')
        if summary_section:
            # Return first few sentences (limit to ~200 chars)
            summary_section = summary_section[:500]
            sentences = re.split(r'[.!?]\s+', summary_section)
            return '. '.join(sentences[:3]) + '.' if sentences else summary_section
        return None

    def _extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from resume.

        Returns:
            List of identified skills
        """
        skills = []
        text_lower = text.lower()

        # First, try to find explicit skills section
        skills_section = self._find_section(text, 'skills')
        if skills_section:
            # Extract skills from the dedicated section
            skills_text = skills_section.lower()
        else:
            # Use full text if no skills section found
            skills_text = text_lower

        # Match against known tech skills
        for skill in self.TECH_SKILLS:
            if skill.lower() in skills_text:
                # Preserve original casing
                skills.append(skill.title() if skill.islower() else skill)

        # Remove duplicates while preserving order
        seen = set()
        unique_skills = []
        for skill in skills:
            skill_lower = skill.lower()
            if skill_lower not in seen:
                seen.add(skill_lower)
                unique_skills.append(skill)

        return unique_skills

    def _extract_experience(self, text: str) -> List[Dict[str, str]]:
        """
        Extract work experience entries.

        Returns:
            List of experience dictionaries
        """
        experience_section = self._find_section(text, 'experience')
        if not experience_section:
            return []

        experiences = []

        # Split by likely job entry patterns (look for date patterns and company names)
        # Date pattern: matches formats like "2020-2023", "Jan 2020 - Present", etc.
        date_pattern = r'(\d{4}|\w+\s+\d{4})\s*[-–—]\s*(\d{4}|\w+\s+\d{4}|Present|Current)'

        lines = experience_section.split('\n')
        current_entry = None

        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            # Check if line contains date range (likely start of new entry)
            date_match = re.search(date_pattern, line, re.IGNORECASE)

            if date_match or (i == 0):
                # Save previous entry if exists
                if current_entry and current_entry.get('title'):
                    experiences.append(current_entry)

                # Start new entry
                current_entry = {
                    'title': '',
                    'company': '',
                    'duration': date_match.group(0) if date_match else '',
                    'description': ''
                }

                # Extract job title and company from this line and next
                if i < len(lines) - 1:
                    # Common format: "Job Title" on one line, "Company | Date" on next
                    potential_title = lines[i].replace(date_match.group(0), '').strip() if date_match else lines[i].strip()
                    current_entry['title'] = potential_title.split('|')[0].strip()

                    if '|' in lines[i]:
                        current_entry['company'] = lines[i].split('|')[1].replace(date_match.group(0) if date_match else '', '').strip()
            elif current_entry is not None:
                # Add to description
                if current_entry['description']:
                    current_entry['description'] += ' ' + line
                else:
                    # Check if this might be company name
                    if not current_entry['company'] and len(line) < 100:
                        current_entry['company'] = line
                    else:
                        current_entry['description'] = line

        # Add last entry
        if current_entry and current_entry.get('title'):
            experiences.append(current_entry)

        return experiences[:5]  # Return max 5 most recent

    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """
        Extract education entries.

        Returns:
            List of education dictionaries
        """
        education_section = self._find_section(text, 'education')
        if not education_section:
            return []

        education = []

        # Common degree patterns
        degree_pattern = r'\b(Ph\.?D\.?|M\.?S\.?|M\.?A\.?|B\.?S\.?|B\.?A\.?|Associate|Bachelor|Master|Doctorate)\b'

        lines = education_section.split('\n')
        current_entry = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check if line contains a degree
            degree_match = re.search(degree_pattern, line, re.IGNORECASE)

            if degree_match:
                # Save previous entry
                if current_entry:
                    education.append(current_entry)

                # Start new entry
                current_entry = {
                    'degree': line,
                    'institution': '',
                    'year': ''
                }

                # Extract year if present
                year_match = re.search(r'\b(19|20)\d{2}\b', line)
                if year_match:
                    current_entry['year'] = year_match.group(0)
            elif current_entry is not None and not current_entry['institution']:
                # Next line after degree is usually institution
                current_entry['institution'] = line

                # Check for year in this line too
                year_match = re.search(r'\b(19|20)\d{2}\b', line)
                if year_match:
                    current_entry['year'] = year_match.group(0)

        # Add last entry
        if current_entry:
            education.append(current_entry)

        return education

    def _extract_certifications(self, text: str) -> List[str]:
        """
        Extract certifications.

        Returns:
            List of certifications
        """
        cert_section = self._find_section(text, 'certifications')
        if not cert_section:
            return []

        certifications = []
        lines = [line.strip() for line in cert_section.split('\n') if line.strip()]

        for line in lines:
            # Skip section headers
            if re.match(self.SECTION_PATTERNS['certifications'], line, re.IGNORECASE):
                continue
            # Skip very short lines (likely not cert names)
            if len(line) > 5:
                certifications.append(line)

        return certifications[:10]  # Return max 10

    def calculate_ats_score(self, parsed_data: Dict[str, Any]) -> float:
        """
        Calculate ATS (Applicant Tracking System) score based on resume completeness.

        Args:
            parsed_data: Parsed resume data

        Returns:
            Score from 0-100
        """
        score = 0.0

        # Contact information (30 points)
        if parsed_data.get('name'):
            score += 10
        if parsed_data.get('email'):
            score += 10
        if parsed_data.get('phone'):
            score += 10

        # Skills (20 points)
        skills_count = len(parsed_data.get('skills', []))
        score += min(skills_count * 2, 20)

        # Experience (25 points)
        experience_count = len(parsed_data.get('experience', []))
        score += min(experience_count * 8, 25)

        # Education (15 points)
        education_count = len(parsed_data.get('education', []))
        score += min(education_count * 7.5, 15)

        # Summary (10 points)
        if parsed_data.get('summary'):
            score += 10

        return min(score, 100.0)
