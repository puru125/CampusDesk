import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { supabase } from "./integrations/supabase/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import UpdatePasswordPage from "./pages/auth/UpdatePasswordPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import StudentsPage from "./pages/admin/StudentsPage";
import TeachersPage from "./pages/admin/TeachersPage";
import CoursesPage from "./pages/admin/CoursesPage";
import TimetablePage from "./pages/admin/TimetablePage";
import FeesPage from "./pages/admin/FeesPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import StudentFeedbackPage from "./pages/admin/StudentFeedbackPage";
import ApprovalsPage from "./pages/admin/ApprovalsPage";
import MyClassesPage from "./pages/teacher/MyClassesPage";
import AttendancePage from "./pages/teacher/AttendancePage";
import TeacherDoubtsPage from "./pages/teacher/TeacherDoubtsPage";
import AssignmentsPage from "./pages/teacher/TeacherAssignmentsPage";
import TeacherCommunicationPage from "./pages/teacher/TeacherCommunicationPage";
import TeacherProfilePage from "./pages/teacher/TeacherProfilePage";
import TeacherIDCardPage from "./pages/teacher/TeacherIDCardPage";
import StudentCoursesPage from "./pages/student/StudentCoursesPage";
import StudentTimetablePage from "./pages/student/StudentTimetablePage";
import StudentAttendancePage from "./pages/student/StudentAttendancePage";
import StudentAssignmentsPage from "./pages/student/StudentAssignmentsPage";
import StudentFeedbackFormPage from "./pages/student/StudentFeedbackFormPage";
import StudentDoubtsPage from "./pages/student/StudentDoubtsPage";
import StudentNotificationsPage from "./pages/student/StudentNotificationsPage";
import Shell from "./components/Shell";
import { Roles } from "./types";
import TeacherReportsPage from "./pages/teacher/TeacherReportsPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Roles[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        let tableName = "";
        if (allowedRoles.includes("admin")) tableName = "admins";
        else if (allowedRoles.includes("teacher")) tableName = "teachers";
        else if (allowedRoles.includes("student")) tableName = "students";

        if (tableName) {
          const { data, error } = await supabase
            .from(tableName)
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
          } else {
            setProfile(data);
          }
        }
      } catch (error) {
        console.error("Unexpected error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user, allowedRoles]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (profile === null) {
    return <div>Loading profile...</div>;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(profile?.role as Roles)
  ) {
    return <div>Unauthorized</div>;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/update-password"
            element={<UpdatePasswordPage />}
          />

          {/* Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <AdminDashboard />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <StudentsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <TeachersPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <CoursesPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/timetable"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <TimetablePage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fees"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <FeesPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <AnnouncementsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <StudentFeedbackPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Shell>
                  <ApprovalsPage />
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
                  <TeacherDashboard />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-classes"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <MyClassesPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/timetable"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <TimetablePage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <AttendancePage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/doubts"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <TeacherDoubtsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <AssignmentsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/reports"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <TeacherReportsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <AnnouncementsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/communication"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <TeacherCommunicationPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/profile"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <TeacherProfilePage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/id-card"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Shell>
                  <TeacherIDCardPage />
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
                  <StudentDashboard />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <StudentCoursesPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <StudentTimetablePage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <StudentAttendancePage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <StudentAssignmentsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/feedback"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <StudentFeedbackFormPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/doubts"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <StudentDoubtsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fees"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <FeesPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <AnnouncementsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Shell>
                  <StudentNotificationsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default App;
