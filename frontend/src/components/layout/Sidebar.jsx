/**
 * Sidebar component for navigation.
 * Displays navigation links with icons and active states.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Briefcase, CheckSquare, Settings } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/resumes', icon: FileText, label: 'Resumes' },
    { path: '/jobs', icon: Briefcase, label: 'Jobs' },
    { path: '/applications', icon: CheckSquare, label: 'Applications' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 custom-scrollbar overflow-y-auto">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">JobAutomate</h1>
        <p className="text-xs text-gray-500 mt-1">Smart Application System</p>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          Phase 1: Resume Management
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
