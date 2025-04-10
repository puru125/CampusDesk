
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({
  children,
  allowedRoles = [],
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-institute-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Prevent access to routes not meant for this user role
  if (user?.role === "teacher" && location.pathname.startsWith("/student/")) {
    return <Navigate to="/teacher/profile" replace />;
  }

  if (user?.role === "student" && location.pathname.startsWith("/teacher/")) {
    return <Navigate to="/student/profile" replace />;
  }

  if (user?.role === "teacher" && location.pathname === "/profile") {
    return <Navigate to="/teacher/profile" replace />;
  }

  if (user?.role === "student" && location.pathname === "/profile") {
    return <Navigate to="/student/profile" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role as UserRole)) {
    // Redirect to dashboard if role is not allowed
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
