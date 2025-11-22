/**
 * Settings page - User preferences and configuration.
 * Configure job search filters, notifications, and automation rules.
 */
import React, { useState } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Notification from '../components/ui/Notification';

const Settings = () => {
  const [notification, setNotification] = useState(null);
  const [settings, setSettings] = useState({
    // Job Search Preferences
    preferred_locations: '',
    remote_only: false,
    min_salary: '',
    max_salary: '',

    // Auto-Apply Settings
    auto_apply_enabled: false,
    min_match_score: 70,
    daily_application_limit: 10,

    // Notifications
    email_notifications: true,
    application_updates: true,
    new_matches: true,
  });

  const handleSave = () => {
    // TODO: Save to backend API
    localStorage.setItem('job_app_settings', JSON.stringify(settings));
    showNotification('success', 'Settings saved successfully!');
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout
      title="Settings"
      subtitle="Configure your preferences and automation rules"
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

      <div className="max-w-4xl">
        {/* Job Search Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Job Search Preferences
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Locations
              </label>
              <input
                type="text"
                value={settings.preferred_locations}
                onChange={(e) => handleChange('preferred_locations', e.target.value)}
                placeholder="e.g., San Francisco, CA; New York, NY"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple locations with semicolon</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary ($)
                </label>
                <input
                  type="number"
                  value={settings.min_salary}
                  onChange={(e) => handleChange('min_salary', e.target.value)}
                  placeholder="e.g., 100000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary ($)
                </label>
                <input
                  type="number"
                  value={settings.max_salary}
                  onChange={(e) => handleChange('max_salary', e.target.value)}
                  placeholder="e.g., 200000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.remote_only}
                  onChange={(e) => handleChange('remote_only', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Only show remote positions</span>
              </label>
            </div>
          </div>
        </div>

        {/* Auto-Apply Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Auto-Apply Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.auto_apply_enabled}
                  onChange={(e) => handleChange('auto_apply_enabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable automatic job applications</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Automatically apply to jobs that meet your criteria (Coming in Phase 4)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Match Score for Auto-Apply
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.min_match_score}
                  onChange={(e) => handleChange('min_match_score', parseInt(e.target.value))}
                  className="flex-1"
                  disabled={!settings.auto_apply_enabled}
                />
                <span className="text-sm font-semibold text-gray-900 w-12">{settings.min_match_score}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only auto-apply to jobs with match score above this threshold
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Application Limit
              </label>
              <input
                type="number"
                value={settings.daily_application_limit}
                onChange={(e) => handleChange('daily_application_limit', parseInt(e.target.value))}
                min="1"
                max="50"
                disabled={!settings.auto_apply_enabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum number of automatic applications per day (recommended: 10-20)
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notification Preferences
          </h2>

          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => handleChange('email_notifications', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Email notifications</span>
              </label>
            </div>

            <div className="ml-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.application_updates}
                  onChange={(e) => handleChange('application_updates', e.target.checked)}
                  disabled={!settings.email_notifications}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Application status updates</span>
              </label>
            </div>

            <div className="ml-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.new_matches}
                  onChange={(e) => handleChange('new_matches', e.target.checked)}
                  disabled={!settings.email_notifications}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">New job matches</span>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
