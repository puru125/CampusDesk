
import React from "react";
import { NavLink } from "react-router-dom";
import { Route } from "@/config/sidebarRoutes";

interface SidebarNavProps {
  routes: Route[];
}

const SidebarNav: React.FC<SidebarNavProps> = ({ routes }) => {
  return (
    <div className="px-3 py-2">
      <div className="space-y-1">
        {routes.map((route) => (
          <NavLink
            key={route.title}
            to={route.href}
            className={({ isActive }) =>
              `flex items-center p-2 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors ${
                isActive
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-700"
              }`
            }
          >
            <route.icon className="mr-2 h-4 w-4" />
            {route.title}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default SidebarNav;
