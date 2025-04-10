
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminRoutes, teacherRoutes, studentRoutes } from "@/config/sidebarRoutes";
import SidebarNav from "./SidebarNav";
import UserProfile from "./UserProfile";
import { Route } from "@/config/sidebarRoutes";

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  let routes: Route[] = [];
  if (user?.role === "admin") {
    routes = adminRoutes;
  } else if (user?.role === "teacher") {
    routes = teacherRoutes;
  } else if (user?.role === "student") {
    routes = studentRoutes;
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 border-r">
      <div className="flex items-center justify-center h-20">
        <span className="text-2xl font-bold">Institute</span>
      </div>

      <ScrollArea className="flex-1 space-y-4 p-4">
        <SidebarNav routes={routes} />
      </ScrollArea>

      <UserProfile onLogout={handleLogout} />
    </div>
  );
};

export default Sidebar;
