"""
Cover letter generation service.
Creates personalized cover letters based on resume and job description.
Uses template-based generation with dynamic content insertion.
"""
from typing import Dict, Any
from datetime import datetime


class CoverLetterGenerator:
    """
    Generates customized cover letters for job applications.

    Uses templates and fills in personalized content based on
    resume data and job requirements.
    """

    def __init__(self):
        """Initialize cover letter generator."""
        self.templates = {
            'professional': self._professional_template,
            'creative': self._creative_template,
            'technical': self._technical_template,
        }

    def generate(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any],
        template: str = 'professional',
        custom_intro: str = None
    ) -> str:
        """
        Generate a cover letter.

        Args:
            resume_data: Parsed resume data
            job_data: Job listing data
            template: Template style (professional, creative, technical)
            custom_intro: Custom introduction paragraph

        Returns:
            Generated cover letter text
        """
        template_func = self.templates.get(template, self._professional_template)
        return template_func(resume_data, job_data, custom_intro)

    def _professional_template(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any],
        custom_intro: str = None
    ) -> str:
        """Generate professional cover letter."""
        # Extract data
        name = resume_data.get('name', 'Applicant')
        email = resume_data.get('email', '')
        phone = resume_data.get('phone', '')
        skills = resume_data.get('skills', [])
        experience = resume_data.get('experience', [])

        job_title = job_data.get('title', 'Position')
        company = job_data.get('company', 'Company')
        required_skills = job_data.get('required_skills', [])

        # Calculate years of experience
        years_exp = len(experience)

        # Find matching skills
        matching_skills = [s for s in skills if s.lower() in [r.lower() for r in required_skills]]
        top_skills = matching_skills[:5] if matching_skills else skills[:5]

        # Get most recent job
        current_role = experience[0]['title'] if experience else 'Professional'

        # Build letter
        letter = f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} position at {company}. With {years_exp}+ years of experience in software development and a proven track record of delivering high-quality solutions, I am confident in my ability to contribute to your team's success.

"""

        if custom_intro:
            letter += f"{custom_intro}\n\n"
        else:
            letter += f"""In my current role as {current_role}, I have successfully developed and maintained applications using modern technologies and best practices. I am particularly excited about this opportunity because it aligns perfectly with my skills and career goals.

"""

        # Skills paragraph
        if top_skills:
            skills_str = ", ".join(top_skills[:3])
            letter += f"""My technical expertise includes {skills_str}, which I understand are key requirements for this position. Throughout my career, I have consistently demonstrated the ability to learn new technologies quickly and apply them effectively to solve complex problems.

"""

        # Experience highlight
        if experience:
            recent_exp = experience[0]
            letter += f"""At {recent_exp.get('company', 'my current position')}, I have {recent_exp.get('description', 'contributed to various projects and initiatives')}. This experience has equipped me with the skills necessary to excel in the {job_title} role.

"""

        # Closing
        letter += f"""I am eager to bring my technical skills, problem-solving abilities, and passion for technology to {company}. I would welcome the opportunity to discuss how my experience and skills align with your needs.

Thank you for considering my application. I look forward to hearing from you.

Sincerely,
{name}
{email}
{phone}
"""

        return letter

    def _creative_template(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any],
        custom_intro: str = None
    ) -> str:
        """Generate creative cover letter."""
        name = resume_data.get('name', 'Applicant')
        email = resume_data.get('email', '')
        phone = resume_data.get('phone', '')
        skills = resume_data.get('skills', [])
        experience = resume_data.get('experience', [])

        job_title = job_data.get('title', 'Position')
        company = job_data.get('company', 'Company')

        years_exp = len(experience)
        top_skills = skills[:4]

        letter = f"""Hello {company} Team!

I'm {name}, and I'm thrilled to apply for the {job_title} position. With {years_exp}+ years of turning coffee into code, I've built a career around creating elegant solutions to complex problems.

"""

        if custom_intro:
            letter += f"{custom_intro}\n\n"
        else:
            letter += f"""What excites me about {company} is your innovative approach to technology. I've been following your work, and the opportunity to contribute to your mission resonates deeply with my professional values.

"""

        if top_skills:
            letter += f"""My toolkit includes {", ".join(top_skills)}, but more importantly, I bring curiosity, creativity, and a collaborative spirit. I believe the best code is written by teams that challenge and support each other.

"""

        letter += f"""I'd love the chance to discuss how my experience and enthusiasm can contribute to {company}'s continued success. Let's build something amazing together!

Best regards,
{name}
{email} | {phone}
"""

        return letter

    def _technical_template(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any],
        custom_intro: str = None
    ) -> str:
        """Generate technical-focused cover letter."""
        name = resume_data.get('name', 'Applicant')
        email = resume_data.get('email', '')
        phone = resume_data.get('phone', '')
        skills = resume_data.get('skills', [])
        experience = resume_data.get('experience', [])

        job_title = job_data.get('title', 'Position')
        company = job_data.get('company', 'Company')
        required_skills = job_data.get('required_skills', [])

        matching_skills = [s for s in skills if s.lower() in [r.lower() for r in required_skills]]
        years_exp = len(experience)

        letter = f"""Dear {company} Engineering Team,

RE: {job_title} Position

I am applying for the {job_title} role with {years_exp}+ years of hands-on software engineering experience, specializing in building scalable, maintainable systems.

**Technical Qualifications:**

"""

        # List matching skills
        if matching_skills:
            for skill in matching_skills[:7]:
                letter += f"• {skill}\n"
            letter += "\n"

        # Technical achievements
        letter += """**Key Achievements:**

"""
        if experience:
            for exp in experience[:2]:
                letter += f"• {exp.get('title', 'Role')} at {exp.get('company', 'Company')}\n"
                if exp.get('description'):
                    desc_short = exp['description'][:150] + "..." if len(exp.get('description', '')) > 150 else exp.get('description', '')
                    letter += f"  {desc_short}\n"
            letter += "\n"

        if custom_intro:
            letter += f"{custom_intro}\n\n"

        letter += f"""I am particularly interested in {company}'s technical challenges and would value the opportunity to contribute to your engineering efforts.

Available for technical interviews at your convenience.

Best regards,
{name}
{email} | {phone}

GitHub/Portfolio: [Available upon request]
"""

        return letter

    def generate_summary(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any]
    ) -> str:
        """
        Generate a brief cover letter summary for quick applications.

        Args:
            resume_data: Resume data
            job_data: Job data

        Returns:
            Brief summary text
        """
        name = resume_data.get('name', 'Applicant')
        skills = resume_data.get('skills', [])
        experience = resume_data.get('experience', [])
        job_title = job_data.get('title', 'position')
        company = job_data.get('company', 'your company')

        years_exp = len(experience)
        top_skills = ", ".join(skills[:3]) if skills else "various technologies"

        summary = f"""I am {name}, a software professional with {years_exp}+ years of experience in {top_skills}. I am excited about the {job_title} opportunity at {company} and believe my skills and experience make me a strong candidate for this role. I am eager to contribute to your team's success and would appreciate the opportunity to discuss how I can add value to {company}."""

        return summary

    def customize_for_keywords(
        self,
        base_letter: str,
        job_keywords: list
    ) -> str:
        """
        Enhance a cover letter by emphasizing specific keywords.

        Args:
            base_letter: Base cover letter text
            job_keywords: Keywords to emphasize

        Returns:
            Enhanced cover letter
        """
        # This is a simple version - in production, you might use NLP
        # to intelligently insert keywords in context
        enhanced = base_letter

        # Add a skills emphasis section if keywords provided
        if job_keywords:
            skills_section = "\n**Relevant Skills:** " + ", ".join(job_keywords) + "\n"
            # Insert before closing
            enhanced = enhanced.replace("Thank you for considering", skills_section + "\nThank you for considering")

        return enhanced
