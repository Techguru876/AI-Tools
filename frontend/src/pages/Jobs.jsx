/**
 * Jobs page - Job discovery and matching.
 * Allows scraping jobs, filtering, and applying.
 */
import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Briefcase } from 'lucide-react';
import Layout from '../components/layout/Layout';
import JobCard from '../components/ui/JobCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Notification from '../components/ui/Notification';
import { getJobs, scrapeJobs, getResumes, createApplication } from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('Software Engineer');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState({
    min_match_score: 0,
    remote_only: false,
    min_salary: null,
    sort_by: 'match_score'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    loadJobs();
    loadResumes();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await getJobs(filters);
      setJobs(data);
    } catch (error) {
      showNotification('error', error.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadResumes = async () => {
    try {
      const data = await getResumes();
      setResumes(data);
      if (data.length > 0) {
        setSelectedResume(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load resumes:', error);
    }
  };

  const handleScrapeJobs = async () => {
    if (!searchQuery.trim()) {
      showNotification('error', 'Please enter a search query');
      return;
    }

    try {
      setScraping(true);
      const result = await scrapeJobs(searchQuery, location, 20, true);
      showNotification('success', `Found ${result.total_found} jobs!`);
      await loadJobs();
    } catch (error) {
      showNotification('error', error.message || 'Failed to scrape jobs');
    } finally {
      setScraping(false);
    }
  };

  const handleApplyFilters = async () => {
    await loadJobs();
    setShowFilters(false);
  };

  const handleApply = async (job) => {
    if (!selectedResume) {
      showNotification('error', 'Please upload a resume first');
      return;
    }

    try {
      await createApplication({
        job_id: job.id,
        resume_id: selectedResume,
        notes: `Applied via JobAutomate on ${new Date().toLocaleDateString()}`
      });

      setAppliedJobs(prev => new Set([...prev, job.id]));
      showNotification('success', `Application submitted for ${job.title}!`);
    } catch (error) {
      showNotification('error', error.message || 'Failed to apply');
    }
  };

  const handleViewDetails = (job) => {
    // TODO: Open job details modal
    window.open(job.url, '_blank');
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <Layout title="Jobs" subtitle="Discover and match with job opportunities">
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

      {/* Search and Scrape */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Jobs</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Query *
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleScrapeJobs}
            disabled={scraping}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {scraping ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Find Jobs
              </>
            )}
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Match Score
                </label>
                <input
                  type="number"
                  value={filters.min_match_score}
                  onChange={(e) => setFilters({ ...filters, min_match_score: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Salary ($)
                </label>
                <input
                  type="number"
                  value={filters.min_salary || ''}
                  onChange={(e) => setFilters({ ...filters, min_salary: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="e.g., 100000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="match_score">Match Score</option>
                  <option value="scraped_date">Date Posted</option>
                  <option value="salary_max">Salary</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.remote_only}
                  onChange={(e) => setFilters({ ...filters, remote_only: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Remote only</span>
              </label>

              <button
                onClick={handleApplyFilters}
                className="ml-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" message="Loading jobs..." />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md border border-gray-200">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No jobs found</p>
          <p className="text-sm text-gray-500 mb-6">
            Try searching for jobs using the form above
          </p>
          <button
            onClick={handleScrapeJobs}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Find Jobs
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Found {jobs.length} jobs
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                onViewDetails={handleViewDetails}
                hasApplied={appliedJobs.has(job.id)}
              />
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Jobs;
