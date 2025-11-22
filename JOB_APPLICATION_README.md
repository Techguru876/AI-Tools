# Job Application Automation System

A full-stack automated job application system built with FastAPI (Python) and React. This intelligent platform helps job seekers manage resumes, discover opportunities, and automate the application process.

## 🚀 Features (ALL PHASES COMPLETED ✅)

### Phase 1: Resume Management ✅
- ✅ Upload resumes (PDF/DOCX) with drag-and-drop interface
- ✅ Automatic parsing and data extraction (contact info, skills, experience, education)
- ✅ ATS (Applicant Tracking System) score calculation
- ✅ Multiple resume versions with tagging
- ✅ Resume metadata management (edit, delete, re-parse)
- ✅ Clean, responsive UI with Tailwind CSS

### Phase 2: Job Discovery Engine ✅
- ✅ Job scraping service (with Playwright support and mock data)
- ✅ Smart job matching algorithm with 4-factor scoring
- ✅ Match score calculation (skills, keywords, experience, location)
- ✅ Job search and filtering (salary, location, remote, match score)
- ✅ Job board integration ready (Indeed, LinkedIn, Glassdoor)
- ✅ Job cards with color-coded match scores

### Phase 3: Application Tracking ✅
- ✅ Kanban-style application board (5 status columns)
- ✅ Application status management (applied, viewed, interview, offer, rejected)
- ✅ Drag-and-drop status updates
- ✅ Dashboard with real-time analytics
- ✅ Application trends and metrics
- ✅ CSV export functionality
- ✅ Response rate tracking

### Phase 4: Automation Features ✅
- ✅ Cover letter generation with 3 template styles
- ✅ Personalized cover letter creation
- ✅ Quick apply functionality
- ✅ Bulk application support
- ✅ Auto-apply settings and rules
- ✅ Daily application limits

### Phase 5: Analytics & Settings ✅
- ✅ Comprehensive dashboard statistics
- ✅ Applications by status visualization
- ✅ Response rate metrics
- ✅ User preferences configuration
- ✅ Job search filters (location, salary, remote)
- ✅ Notification preferences
- ✅ Auto-apply thresholds

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.9+)
- **Database:** SQLite (PostgreSQL-ready)
- **Resume Processing:** PyPDF2, python-docx
- **ORM:** SQLAlchemy
- **Validation:** Pydantic

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Icons:** Lucide React

## 📋 Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd AI-Tools
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Generate test resume files (optional but recommended)
python app/tests/generate_test_files.py
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# The frontend is now ready to run
```

## ▶️ Running the Application

### Start Backend Server

```bash
# From backend directory with virtual environment activated
cd backend
python main.py

# Server will start at: http://localhost:8000
# API documentation: http://localhost:8000/api/docs
```

### Start Frontend Development Server

```bash
# From frontend directory in a new terminal
cd frontend
npm run dev

# Frontend will start at: http://localhost:3000
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/api/docs (Swagger UI)
- **Alternative API Docs:** http://localhost:8000/api/redoc (ReDoc)

## 📁 Project Structure

```
AI-Tools/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── resumes.py        # Resume CRUD endpoints
│   │   │       └── __init__.py
│   │   ├── models/
│   │   │   ├── database.py           # SQLAlchemy models
│   │   │   ├── schemas.py            # Pydantic schemas
│   │   │   └── __init__.py
│   │   ├── services/
│   │   │   ├── resume_parser.py      # Resume parsing logic
│   │   │   └── __init__.py
│   │   ├── utils/
│   │   │   ├── database.py           # Database utilities
│   │   │   ├── validation.py         # File validation
│   │   │   └── __init__.py
│   │   ├── tests/
│   │   │   ├── test_data/            # Test resume files
│   │   │   ├── generate_test_files.py
│   │   │   ├── test_resume_parser.py
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── uploads/                      # Uploaded resume storage
│   ├── main.py                       # FastAPI application entry
│   ├── requirements.txt              # Python dependencies
│   └── .env.example                  # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable UI components
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── UploadZone.jsx
│   │   │   │   ├── ResumeCard.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── Notification.jsx
│   │   │   └── layout/               # Layout components
│   │   │       ├── Sidebar.jsx
│   │   │       ├── Header.jsx
│   │   │       └── Layout.jsx
│   │   ├── pages/                    # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Resumes.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── Applications.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js                # API client
│   │   ├── utils/
│   │   │   └── helpers.js            # Utility functions
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── JOB_APPLICATION_README.md (This file)
```

## 🧪 Testing

### Run Backend Tests

```bash
# From backend directory
cd backend

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest app/tests/test_resume_parser.py -v

# Run with coverage
pytest --cov=app --cov-report=html
```

### Generate Test Resume Files

```bash
# From backend directory
python app/tests/generate_test_files.py
```

This will create:
- `backend/app/tests/test_data/test_resume.pdf`
- `backend/app/tests/test_data/test_resume.docx`

## 🎨 UI/UX Design

The application follows modern design principles:

- **Color Scheme:** Professional blue/gray tones
  - Primary: `blue-600` (#2563eb)
  - Secondary: `gray-700`
  - Background: `gray-50`
- **Typography:** Inter font family
- **Spacing:** Consistent padding (p-4, p-6, gap-4)
- **Components:** Card-based layout with shadow-md
- **Interactive Elements:** Smooth transitions, hover effects
- **Responsive:** Mobile-first design with breakpoints

## 📖 API Documentation

### Main Endpoints

#### Resume Management
- `POST /api/resumes/upload` - Upload and parse a resume
- `GET /api/resumes/` - Get all resumes for user
- `GET /api/resumes/{id}` - Get specific resume
- `PUT /api/resumes/{id}` - Update resume metadata
- `DELETE /api/resumes/{id}` - Delete resume
- `POST /api/resumes/{id}/reparse` - Re-parse existing resume

#### Job Discovery
- `POST /api/jobs/scrape` - Scrape jobs from job boards
- `GET /api/jobs/` - Get jobs with filters (match score, salary, remote, location)
- `GET /api/jobs/{id}` - Get specific job
- `POST /api/jobs/{id}/calculate-match` - Calculate match score for job
- `POST /api/jobs/recalculate-all-matches` - Recalculate all job matches

#### Application Tracking
- `POST /api/applications/` - Create new application
- `GET /api/applications/` - Get all applications with filters
- `GET /api/applications/{id}` - Get specific application
- `PUT /api/applications/{id}` - Update application status
- `DELETE /api/applications/{id}` - Delete application
- `GET /api/applications/stats/dashboard` - Get dashboard statistics
- `GET /api/applications/analytics/trends` - Get application trends
- `POST /api/applications/bulk-apply` - Bulk apply to multiple jobs

### Example: Upload Resume

```bash
curl -X POST "http://localhost:8000/api/resumes/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/resume.pdf" \
  -F "title=Software Engineer Resume" \
  -F "tags=[\"technical\",\"senior\"]" \
  -F "user_id=1"
```

## 🔐 Security Features

- File type validation (only PDF/DOCX)
- File size limits (10MB max)
- Filename sanitization to prevent path traversal
- Input validation with Pydantic
- CORS configuration
- Prepared for authentication (JWT ready)

## 🎯 Quick Start Workflow

### Step 1: Upload Your Resume
1. Navigate to **Resumes** page
2. Click "Upload New Resume"
3. Drag & drop your PDF/DOCX resume
4. Add a title and tags
5. System automatically parses and scores your resume

### Step 2: Find Jobs
1. Go to **Jobs** page
2. Enter search query (e.g., "Software Engineer")
3. Set location or enable "Remote only"
4. Click "Find Jobs" (uses mock data for testing)
5. View match scores for each job

### Step 3: Apply to Jobs
1. Review job cards with match scores
2. Click "Quick Apply" on jobs you like
3. Applications are automatically tracked

### Step 4: Track Applications
1. Visit **Applications** page
2. View Kanban board with 5 status columns
3. Drag cards to update status
4. Export applications to CSV

### Step 5: Configure Settings
1. Go to **Settings** page
2. Set job search preferences
3. Configure auto-apply rules (thresholds)
4. Set notification preferences

## 🚧 Development Roadmap

### ✅ Phase 1: Resume Management (COMPLETED)
- Resume upload and parsing
- Data extraction and ATS scoring
- Basic UI/UX implementation

### ✅ Phase 2: Job Discovery (COMPLETED)
- Web scraping with Playwright
- Job matching algorithm
- Match score calculation

### ✅ Phase 3: Application Tracking (COMPLETED)
- Status tracking dashboard
- Analytics and metrics
- Kanban board interface

### ✅ Phase 4: Automation (COMPLETED)
- Cover letter generation
- Quick apply functionality
- Bulk operations

### ✅ Phase 5: Advanced Features (COMPLETED)
- Analytics dashboard
- User preferences
- CSV export

## 🐛 Troubleshooting

### Backend Issues

**Module not found errors:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Database errors:**
```bash
# Delete existing database and restart
rm job_application.db
python main.py
```

### Frontend Issues

**Dependency errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS errors:**
- Ensure backend is running on port 8000
- Check ALLOWED_ORIGINS in backend/.env

**API connection errors:**
- Verify backend server is running
- Check proxy configuration in vite.config.js

## 📝 Environment Variables

### Backend (.env)

```env
DATABASE_URL=sqlite:///./job_application.db
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=.pdf,.docx
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- React and Vite for modern frontend development
- Tailwind CSS for beautiful, responsive styling
- All open-source contributors

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review API docs at http://localhost:8000/api/docs

---

**Built with ❤️ for job seekers everywhere**
