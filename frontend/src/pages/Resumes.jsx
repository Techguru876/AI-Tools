/**
 * Resumes page - Manage resume uploads and view parsed data.
 * Includes upload functionality and resume list with CRUD operations.
 */
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Layout from '../components/layout/Layout';
import UploadZone from '../components/ui/UploadZone';
import ResumeCard from '../components/ui/ResumeCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Notification from '../components/ui/Notification';
import { getResumes, uploadResume, deleteResume } from '../services/api';

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeTitle, setResumeTitle] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [viewingResume, setViewingResume] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await getResumes();
      setResumes(data);
    } catch (error) {
      showNotification('error', error.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file && !resumeTitle) {
      // Auto-fill title from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setResumeTitle(nameWithoutExt);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      showNotification('error', 'Please select a file');
      return;
    }

    if (!resumeTitle.trim()) {
      showNotification('error', 'Please enter a resume title');
      return;
    }

    try {
      setUploading(true);

      // Parse tags from comma-separated string
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await uploadResume(selectedFile, resumeTitle, tagArray);

      showNotification('success', 'Resume uploaded and parsed successfully!');

      // Reset form and reload resumes
      setShowUploadModal(false);
      setSelectedFile(null);
      setResumeTitle('');
      setTags('');
      loadResumes();
    } catch (error) {
      showNotification('error', error.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    try {
      await deleteResume(resumeId);
      showNotification('success', 'Resume deleted successfully');
      loadResumes();
    } catch (error) {
      showNotification('error', error.message || 'Failed to delete resume');
    }
  };

  const handleEdit = (resume) => {
    // TODO: Implement edit functionality
    showNotification('info', 'Edit functionality coming in next update');
  };

  const handleView = (resume) => {
    setViewingResume(resume);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <Layout
      title="Resumes"
      subtitle="Manage your resume versions and parsed data"
    >
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Upload Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Upload New Resume
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Upload Resume</h2>
              <p className="text-sm text-gray-600 mt-1">
                Upload a PDF or DOCX resume for automatic parsing
              </p>
            </div>

            <form onSubmit={handleUpload} className="p-6">
              <div className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume File *
                  </label>
                  <UploadZone onFileSelect={handleFileSelect} />
                </div>

                {/* Resume Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume Title *
                  </label>
                  <input
                    type="text"
                    value={resumeTitle}
                    onChange={(e) => setResumeTitle(e.target.value)}
                    placeholder="e.g., Software Engineer Resume - Tech Focus"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    required
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., technical, senior, remote"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add tags to organize and filter your resumes
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setResumeTitle('');
                    setTags('');
                  }}
                  className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || !resumeTitle.trim() || uploading}
                  className="flex-1 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    'Upload & Parse'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Resume Modal */}
      {viewingResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{viewingResume.title}</h2>
              <p className="text-sm text-gray-600 mt-1">Parsed Resume Details</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {viewingResume.parsed_data_json?.name || 'N/A'}</div>
                    <div><span className="font-medium">Email:</span> {viewingResume.parsed_data_json?.email || 'N/A'}</div>
                    <div><span className="font-medium">Phone:</span> {viewingResume.parsed_data_json?.phone || 'N/A'}</div>
                    <div><span className="font-medium">Location:</span> {viewingResume.parsed_data_json?.location || 'N/A'}</div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">File Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Filename:</span> {viewingResume.file_name}</div>
                    <div><span className="font-medium">Type:</span> {viewingResume.file_type.toUpperCase()}</div>
                    <div><span className="font-medium">ATS Score:</span> {Math.round(viewingResume.ats_score)}%</div>
                    <div><span className="font-medium">Version:</span> {viewingResume.version}</div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {viewingResume.parsed_data_json?.skills && viewingResume.parsed_data_json.skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Skills ({viewingResume.parsed_data_json.skills.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingResume.parsed_data_json.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {viewingResume.parsed_data_json?.experience && viewingResume.parsed_data_json.experience.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Work Experience ({viewingResume.parsed_data_json.experience.length})</h3>
                  <div className="space-y-4">
                    {viewingResume.parsed_data_json.experience.map((exp, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900">{exp.title || 'Position'}</h4>
                        {exp.company && <p className="text-sm text-gray-600">{exp.company}</p>}
                        {exp.duration && <p className="text-xs text-gray-500 mt-1">{exp.duration}</p>}
                        {exp.description && <p className="text-sm text-gray-700 mt-2">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {viewingResume.parsed_data_json?.education && viewingResume.parsed_data_json.education.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Education ({viewingResume.parsed_data_json.education.length})</h3>
                  <div className="space-y-3">
                    {viewingResume.parsed_data_json.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900">{edu.degree || 'Degree'}</h4>
                        {edu.institution && <p className="text-sm text-gray-600">{edu.institution}</p>}
                        {edu.year && <p className="text-xs text-gray-500">{edu.year}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setViewingResume(null)}
                className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resumes List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" message="Loading resumes..." />
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md border border-gray-200">
          <p className="text-gray-600 mb-4">No resumes uploaded yet</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Upload Your First Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Resumes;
