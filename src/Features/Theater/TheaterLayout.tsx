import React from 'react';
import TheaterSidebar from './TheaterSideBar';
import { TheaterOwnerLayoutProps } from "../../Core/TheaterTypes";

const TheaterOwnerLayout: React.FC<TheaterOwnerLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar - Fix width */}
      <TheaterSidebar />

      {/* Main Content Area - Offset by sidebar width */}
      <div className="flex-1 ml-64 p-8">
        {children}
      </div>
    </div>
  );
};

export default TheaterOwnerLayout;
