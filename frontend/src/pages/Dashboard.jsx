/**
 * Dashboard page - Main overview of application statistics.
 * Displays key metrics and recent activity.
 */
import React, { useState, useEffect } from 'react';
import { FileText, Briefcase, CheckSquare, Calendar } from 'lucide-react';
import Layout from '../components/layout/Layout';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getResumes } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalJobs: 0,
    totalApplications: 0,
    upcomingInterviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch resumes count
      const resumes = await getResumes();
      setStats({
        totalResumes: resumes.length,
        totalJobs: 0, // TODO: Implement in future phases
        totalApplications: 0, // TODO: Implement in future phases
        upcomingInterviews: 0, // TODO: Implement in future phases
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Dashboard"
      subtitle="Overview of your job application activity"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FileText}
          title="Total Resumes"
          value={stats.totalResumes}
          loading={loading}
        />
        <StatCard
          icon={Briefcase}
          title="Active Jobs"
          value={stats.totalJobs}
          loading={loading}
        />
        <StatCard
          icon={CheckSquare}
          title="Applications"
          value={stats.totalApplications}
          loading={loading}
        />
        <StatCard
          icon={Calendar}
          title="Interviews"
          value={stats.upcomingInterviews}
          loading={loading}
        />
      </div>

      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to JobAutomate! 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          Your intelligent job application automation system. Get started by uploading your resume
          and let our system help you find and apply to relevant job opportunities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 bg-primary-50 rounded-lg border border-primary-200">
            <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload Resume</h3>
            <p className="text-sm text-gray-600">
              Start by uploading your resume. Our system will parse and analyze it automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h3 className="font-semibold text-gray-500 mb-2">Find Jobs (Coming Soon)</h3>
            <p className="text-sm text-gray-500">
              Automatically discover relevant job opportunities from multiple job boards.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h3 className="font-semibold text-gray-500 mb-2">Apply & Track (Coming Soon)</h3>
            <p className="text-sm text-gray-500">
              Automate applications and track your progress with comprehensive analytics.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Phase 1 Features (Current):</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-gray-700">Upload and parse resumes (PDF/DOCX)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-gray-700">Automatic data extraction (contact info, skills, experience)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-gray-700">ATS score calculation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-gray-700">Resume management with tagging</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
