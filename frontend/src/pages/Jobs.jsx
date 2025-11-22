/**
 * Jobs page - Job discovery and matching (Phase 2).
 * Placeholder for future implementation.
 */
import React from 'react';
import Layout from '../components/layout/Layout';
import { Briefcase } from 'lucide-react';

const Jobs = () => {
  return (
    <Layout
      title="Jobs"
      subtitle="Discover and match with job opportunities"
    >
      <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
        <div className="inline-block p-6 bg-primary-100 rounded-full mb-6">
          <Briefcase className="w-16 h-16 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming in Phase 2</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          The job discovery engine will automatically scrape job boards, match opportunities
          with your resume, and calculate compatibility scores. This feature will be available
          in the next phase of development.
        </p>
        <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
          Phase 2: Job Discovery & Matching
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;
