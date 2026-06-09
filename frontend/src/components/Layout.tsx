import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./common/Sidebar/Sidebar";
import Header from "./common/Sidebar/common/Header";

interface LayoutProps {
  type: "admin" | "vendor";
}

export function Layout({ type }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-screen bg-background text-text-main flex overflow-hidden">
      <Sidebar type={type} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 h-screen overflow-hidden">
        <Header type={type} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 w-full min-w-0 overflow-y-auto scrollbar-dashboard p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}