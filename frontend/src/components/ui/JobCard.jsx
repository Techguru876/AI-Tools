/**
 * JobCard component for displaying job listings with match scores.
 * Shows job details, match score badge, and apply actions.
 */
import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { getMatchScoreColor } from '../../utils/helpers';

const JobCard = ({ job, onApply, onViewDetails, hasApplied = false }) => {
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply(job);
    } finally {
      setIsApplying(false);
    }
  };

  // Get match score color
  const matchScoreColor = getMatchScoreColor(job.match_score || 0);

  // Format salary
  const formatSalary = () => {
    if (job.salary_range) return job.salary_range;
    if (job.salary_min && job.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`;
    }
    if (job.salary_min) return `$${(job.salary_min / 1000).toFixed(0)}k+`;
    return 'Not specified';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 cursor-pointer" onClick={() => onViewDetails(job)}>
                {job.title}
              </h3>
              <p className="text-sm font-medium text-gray-700">{job.company}</p>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className={`px-3 py-1 ${matchScoreColor} rounded-full text-sm font-semibold`}>
            {Math.round(job.match_score || 0)}% Match
          </div>
        </div>

        {/* Location and Remote */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location || 'Location not specified'}</span>
          </div>
          {job.remote && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium">
              Remote
            </span>
          )}
        </div>

        {/* Salary */}
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>{formatSalary()}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Description */}
        {job.description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-3">
            {job.description}
          </p>
        )}

        {/* Required Skills */}
        {job.required_skills && job.required_skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.required_skills.slice(0, 6).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {skill}
                </span>
              ))}
              {job.required_skills.length > 6 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                  +{job.required_skills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">
            {job.scraped_date ? new Date(job.scraped_date).toLocaleDateString() : 'Recently posted'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="View on job board"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {hasApplied ? (
            <button
              disabled
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              Applied
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? 'Applying...' : 'Quick Apply'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
