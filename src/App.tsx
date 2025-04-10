import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Shell from "@/components/layout/Shell";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import NotFound from "./pages/NotFound";
import StudentsPage from "./pages/students/StudentsPage";
import AddStudentPage from "./pages/students/AddStudentPage";
import TeachersPage from "./pages/teachers/TeachersPage";
import AddTeacherPage from "./pages/teachers/AddTeacherPage";
import CoursesPage from "./pages/courses/CoursesPage";
import AddCoursePage from "./pages/courses/AddCoursePage";
import CourseDetailsPage from "./pages/courses/CourseDetailsPage";
import CourseEditPage from "./pages/courses/CourseEditPage";
import TimetablePage from "./pages/timetable/TimetablePage";
import AddTimetableEntryPage from "./pages/timetable/AddTimetableEntryPage";
import ExamsPage from "./pages/exams/ExamsPage";
import AddExamPage from "./pages/exams/AddExamPage";
import EnrollmentApprovalPage from "./pages/settings/EnrollmentApprovalPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AnnouncementsPage from "./pages/announcements/AnnouncementsPage";

// Fee Management Pages
import FeesPage from "./pages/fees/FeesPage";
import AddFeeStructurePage from "./pages/fees/AddFeeStructurePage";
import MakePaymentPage from "./pages/fees/MakePaymentPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <Dashboard />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              
              {/* Students Routes */}
              <Route 
                path="/students" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <StudentsPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/students/new" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <AddStudentPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              
              {/* Teachers Routes */}
              <Route 
                path="/teachers" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <TeachersPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teachers/new" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <AddTeacherPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              
              {/* Courses Routes */}
              <Route 
                path="/courses" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <CoursesPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/new" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <AddCoursePage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/:courseId" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <CourseDetailsPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/:courseId/edit" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <CourseEditPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              
              {/* Timetable Routes */}
              <Route 
                path="/timetable" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <TimetablePage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/timetable/new" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <AddTimetableEntryPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              
              {/* Exams Routes */}
              <Route 
                path="/exams" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <ExamsPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/exams/new" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <AddExamPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              
              {/* Fees Management Routes */}
              <Route 
                path="/fees" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <FeesPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/fees/structure/new" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <AddFeeStructurePage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/fees/structure/:id" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <AddFeeStructurePage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/fees/payment/new" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <MakePaymentPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              
              {/* Announcements Route */}
              <Route 
                path="/announcements" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <AnnouncementsPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              
              {/* Enrollment Approval Page */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <EnrollmentApprovalPage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/profile" 
                element={
                  <ProtectedRoute>
                    <Shell>
                      <AdminProfilePage />
                    </Shell>
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect to login if path is empty */}
              <Route path="" element={<Navigate to="/login" />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
