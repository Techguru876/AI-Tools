/**
 * Settings page - User preferences and configuration.
 * Placeholder for future implementation.
 */
import React from 'react';
import Layout from '../components/layout/Layout';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <Layout
      title="Settings"
      subtitle="Configure your preferences and automation rules"
    >
      <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
        <div className="inline-block p-6 bg-primary-100 rounded-full mb-6">
          <SettingsIcon className="w-16 h-16 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming in Phase 5</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Settings will allow you to configure job search filters, auto-apply rules, notification
          preferences, job board credentials, and customize your automation workflow.
        </p>
        <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
          Phase 5: User Preferences & Controls
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
