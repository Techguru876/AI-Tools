/**
 * Main layout component that wraps all pages.
 * Includes sidebar and header with content area.
 */
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        <Header title={title} subtitle={subtitle} />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
