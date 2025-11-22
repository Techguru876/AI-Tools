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

export default api;
