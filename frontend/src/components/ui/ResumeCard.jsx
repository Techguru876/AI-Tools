/**
 * ResumeCard component for displaying resume information.
 * Shows preview, parsed data, ATS score, and action buttons.
 */
import React, { useState } from 'react';
import { FileText, Edit2, Trash2, RefreshCw, Eye, Calendar, Award } from 'lucide-react';
import { formatDate, getScoreColor } from '../../utils/helpers';

const ResumeCard = ({ resume, onEdit, onDelete, onView }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${resume.title}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(resume.id);
      } catch (error) {
        setIsDeleting(false);
      }
    }
  };

  // Extract key information from parsed data
  const parsedData = resume.parsed_data_json || {};
  const name = parsedData.name || 'Not detected';
  const email = parsedData.email || 'Not detected';
  const skillsCount = parsedData.skills?.length || 0;
  const experienceCount = parsedData.experience?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{resume.title}</h3>
              <p className="text-sm text-gray-600">{resume.file_name}</p>
            </div>
          </div>

          {/* ATS Score Badge */}
          <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${getScoreColor(resume.ats_score)}`}>
            {Math.round(resume.ats_score)}% ATS
          </div>
        </div>

        {/* Tags */}
        {resume.tags && resume.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resume.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Parsed Data Summary */}
      <div className="p-6 bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Parsed Information</h4>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="text-gray-600 w-24">Name:</span>
            <span className="text-gray-900 font-medium">{name}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-600 w-24">Email:</span>
            <span className="text-gray-900 font-medium">{email}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-600 w-24">Phone:</span>
            <span className="text-gray-900 font-medium">{parsedData.phone || 'Not detected'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-gray-600">{skillsCount} skills</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-gray-600">{experienceCount} jobs</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Uploaded {formatDate(resume.created_at)}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(resume)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(resume)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;
