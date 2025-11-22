/**
 * API service for communicating with the backend.
 * Handles all HTTP requests using axios.
 */
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens (future implementation)
api.interceptors.request.use(
  (config) => {
    // TODO: Add auth token when authentication is implemented
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.detail || error.response.data?.error || 'An error occurred';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('No response from server. Please check your connection.'));
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

// ============================================================================
// Resume API
// ============================================================================

/**
 * Upload a resume file with metadata
 * @param {File} file - Resume file (PDF or DOCX)
 * @param {string} title - Resume title
 * @param {Array<string>} tags - Array of tags
 * @returns {Promise<Object>} Created resume object
 */
export const uploadResume = async (file, title, tags = []) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('tags', JSON.stringify(tags));
  formData.append('user_id', '1'); // TODO: Use actual user ID from auth

  const response = await api.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Get all resumes for the current user
 * @returns {Promise<Array>} List of resumes
 */
export const getResumes = async () => {
  const response = await api.get('/resumes/');
  return response.data;
};

/**
 * Get a specific resume by ID
 * @param {number} resumeId - Resume ID
 * @returns {Promise<Object>} Resume object
 */
export const getResume = async (resumeId) => {
  const response = await api.get(`/resumes/${resumeId}`);
  return response.data;
};

/**
 * Update resume metadata
 * @param {number} resumeId - Resume ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated resume object
 */
export const updateResume = async (resumeId, updates) => {
  const response = await api.put(`/resumes/${resumeId}`, updates);
  return response.data;
};

/**
 * Delete a resume
 * @param {number} resumeId - Resume ID
 * @returns {Promise<Object>} Success message
 */
export const deleteResume = async (resumeId) => {
  const response = await api.delete(`/resumes/${resumeId}`);
  return response.data;
};

/**
 * Re-parse an existing resume
 * @param {number} resumeId - Resume ID
 * @returns {Promise<Object>} Updated resume object
 */
export const reparseResume = async (resumeId) => {
  const response = await api.post(`/resumes/${resumeId}/reparse`);
  return response.data;
};

// ============================================================================
// Health Check
// ============================================================================

/**
 * Check API health
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// ============================================================================
// Jobs API
// ============================================================================

/**
 * Scrape jobs from job boards
 * @param {string} query - Search query
 * @param {string} location - Location filter
 * @param {number} maxResults - Maximum results
 * @param {boolean} useMock - Use mock data
 * @returns {Promise<Object>} Scraping summary
 */
export const scrapeJobs = async (query, location = '', maxResults = 20, useMock = true) => {
  const response = await api.post('/jobs/scrape', null, {
    params: { query, location, max_results: maxResults, use_mock: useMock }
  });
  return response.data;
};

/**
 * Get all jobs with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of jobs
 */
export const getJobs = async (filters = {}) => {
  const response = await api.get('/jobs/', { params: filters });
  return response.data;
};

/**
 * Get specific job by ID
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Job data
 */
export const getJob = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

/**
 * Calculate match score between job and resume
 * @param {number} jobId - Job ID
 * @param {number} resumeId - Resume ID
 * @returns {Promise<Object>} Match result
 */
export const calculateJobMatch = async (jobId, resumeId) => {
  const response = await api.post(`/jobs/${jobId}/calculate-match`, null, {
    params: { resume_id: resumeId }
  });
  return response.data;
};

/**
 * Recalculate all job matches for a resume
 * @param {number} resumeId - Resume ID
 * @returns {Promise<Object>} Summary
 */
export const recalculateMatches = async (resumeId) => {
  const response = await api.post('/jobs/recalculate-all-matches', null, {
    params: { resume_id: resumeId }
  });
  return response.data;
};

// ============================================================================
// Applications API
// ============================================================================

/**
 * Create a new application
 * @param {Object} applicationData - Application data
 * @returns {Promise<Object>} Created application
 */
export const createApplication = async (applicationData) => {
  const response = await api.post('/applications/', applicationData);
  return response.data;
};

/**
 * Get all applications
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of applications
 */
export const getApplications = async (filters = {}) => {
  const response = await api.get('/applications/', { params: filters });
  return response.data;
};

/**
 * Get specific application
 * @param {number} applicationId - Application ID
 * @returns {Promise<Object>} Application data
 */
export const getApplication = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}`);
  return response.data;
};

/**
 * Update application
 * @param {number} applicationId - Application ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated application
 */
export const updateApplication = async (applicationId, updates) => {
  const response = await api.put(`/applications/${applicationId}`, updates);
  return response.data;
};

/**
 * Delete application
 * @param {number} applicationId - Application ID
 * @returns {Promise<Object>} Success message
 */
export const deleteApplication = async (applicationId) => {
  const response = await api.delete(`/applications/${applicationId}`);
  return response.data;
};

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard stats
 */
export const getDashboardStats = async () => {
  const response = await api.get('/applications/stats/dashboard');
  return response.data;
};

/**
 * Get application trends
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} Trend data
 */
export const getApplicationTrends = async (days = 30) => {
  const response = await api.get('/applications/analytics/trends', {
    params: { days }
  });
  return response.data;
};

/**
 * Bulk apply to multiple jobs
 * @param {Array<number>} jobIds - Job IDs to apply to
 * @param {number} resumeId - Resume ID to use
 * @returns {Promise<Object>} Summary
 */
export const bulkApply = async (jobIds, resumeId) => {
  const response = await api.post('/applications/bulk-apply', null, {
    params: { job_ids: jobIds.join(','), resume_id: resumeId }
  });
  return response.data;
};

export default api;
