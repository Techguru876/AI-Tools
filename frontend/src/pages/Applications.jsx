/**
 * Applications page - Track and manage job applications.
 * Displays applications in a Kanban-style board.
 */
import React, { useState, useEffect } from 'react';
import { Plus, Download } from 'lucide-react';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Notification from '../components/ui/Notification';
import { getApplications, updateApplication, deleteApplication } from '../services/api';

const statusColumns = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-500' },
  { id: 'viewed', title: 'Viewed', color: 'bg-yellow-500' },
  { id: 'interview', title: 'Interview', color: 'bg-purple-500' },
  { id: 'offer', title: 'Offer', color: 'bg-green-500' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500' },
];

const ApplicationCard = ({ application, onStatusChange, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">{application.job?.title || 'Job Title'}</h4>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-gray-600"
        >
          ⋮
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-2">{application.job?.company || 'Company'}</p>

      <div className="text-xs text-gray-500 mb-3">
        Applied: {new Date(application.applied_date).toLocaleDateString()}
      </div>

      {application.notes && (
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{application.notes}</p>
      )}

      {showMenu && (
        <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
          {statusColumns.map((status) => (
            <button
              key={status.id}
              onClick={() => {
                onStatusChange(application.id, status.id);
                setShowMenu(false);
              }}
              className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
            >
              Move to {status.title}
            </button>
          ))}
          <button
            onClick={() => {
              if (window.confirm('Delete this application?')) {
                onDelete(application.id);
              }
              setShowMenu(false);
            }}
            className="block w-full text-left px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {}
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getApplications();
      setApplications(data);

      // Calculate stats
      const byStatus = data.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        total: data.length,
        byStatus
      });
    } catch (error) {
      showNotification('error', error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplication(applicationId, { status: newStatus });
      await loadApplications();
      showNotification('success', 'Status updated successfully');
    } catch (error) {
      showNotification('error', error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (applicationId) => {
    try {
      await deleteApplication(applicationId);
      await loadApplications();
      showNotification('success', 'Application deleted');
    } catch (error) {
      showNotification('error', error.message || 'Failed to delete application');
    }
  };

  const exportToCSV = () => {
    const headers = ['Job Title', 'Company', 'Status', 'Applied Date', 'Notes'];
    const rows = applications.map(app => [
      app.job?.title || '',
      app.job?.company || '',
      app.status,
      new Date(app.applied_date).toLocaleDateString(),
      app.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const getApplicationsByStatus = (status) => {
    return applications.filter(app => app.status === status);
  };

  return (
    <Layout title="Applications" subtitle="Track and manage your job applications">
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

      {/* Stats and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total Applications: <span className="font-semibold text-gray-900">{stats.total}</span>
          </div>
        </div>

        <button
          onClick={exportToCSV}
          disabled={applications.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" message="Loading applications..." />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md border border-gray-200">
          <p className="text-gray-600 mb-4">No applications yet</p>
          <p className="text-sm text-gray-500">
            Start applying to jobs from the Jobs page
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statusColumns.map((column) => {
            const columnApps = getApplicationsByStatus(column.id);
            return (
              <div key={column.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {column.title}
                  </h3>
                  <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {columnApps.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnApps.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  ))}

                  {columnApps.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && applications.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statusColumns.map((column) => (
              <div key={column.id} className="text-center">
                <div className={`w-12 h-12 ${column.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                  {stats.byStatus[column.id] || 0}
                </div>
                <p className="text-sm text-gray-600">{column.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Applications;
