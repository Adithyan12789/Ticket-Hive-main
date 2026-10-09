import React from 'react';
import AdminSidebar from './AdminSideBar';
import { AdminLayoutProps } from '../../Core/AdminTypes';

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, adminName }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar - Stays fixed on the left (controlled by flex layout) */}
      <AdminSidebar adminName={adminName} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 overflow-y-auto w-full transition-all duration-300">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
