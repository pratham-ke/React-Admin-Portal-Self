import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import Navbar from "../ui/Navbar";
import ToastContainer from "../components/common/ToastContainer";
import TopBanner from "../components/common/TopBanner";

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex">
      <Sidebar open={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <TopBanner />
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    </div>
  );
};

export default DashboardLayout;