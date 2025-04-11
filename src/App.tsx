
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { supabase } from "./integrations/supabase/client";
import { Toaster } from "./components/ui/toaster";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { UserRole } from "./types";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Modified ProtectedRoute component from inline to use the imported one
const Shell = ({ children }: { children: React.ReactNode }) => {
  return <div className="shell-container">{children}</div>;
};

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/register" element={<div>Register Page</div>} />
          <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
          <Route path="/update-password" element={<div>Update Password Page</div>} />

          {/* Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <div>Admin Dashboard</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <div>Students Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <div>Teachers Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <div>Courses Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/timetable"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <div>Timetable Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fees"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <div>Fees Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <div>Announcements Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <div>Student Feedback Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <div>Approvals Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <div>Teacher Dashboard</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-classes"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <div>My Classes Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/timetable"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <div>Timetable Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <div>Attendance Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/doubts"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <div>Teacher Doubts Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <div>Assignments Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/reports"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <div>Teacher Reports Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <div>Announcements Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/communication"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <div>Teacher Communication Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/profile"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <div>Teacher Profile Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/id-card"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <div>Teacher ID Card Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <div>Student Dashboard</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <div>Student Courses Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <div>Student Timetable Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <div>Student Attendance Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <div>Student Assignments Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/feedback"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <div>Student Feedback Form Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/doubts"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <div>Student Doubts Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fees"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <div>Fees Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <div>Announcements Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <div>Student Notifications Page</div>
                </Shell>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
};

export default App;
