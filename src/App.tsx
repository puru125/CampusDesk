
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Shell from "@/components/layout/Shell";

// Pages
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

// Dashboard
import Dashboard from "@/pages/dashboard/Dashboard";
import StudentLoginSuccessPage from "@/pages/dashboard/StudentLoginSuccessPage";
import TeacherLoginSuccessPage from "@/pages/dashboard/TeacherLoginSuccessPage";

// Students
import StudentsPage from "@/pages/students/StudentsPage";
import AddStudentPage from "@/pages/students/AddStudentPage";

// Teachers
import TeachersPage from "@/pages/teachers/TeachersPage";
import AddTeacherPage from "@/pages/teachers/AddTeacherPage";

// Courses
import CoursesPage from "@/pages/courses/CoursesPage";
import AddCoursePage from "@/pages/courses/AddCoursePage";
import CourseDetailsPage from "@/pages/courses/CourseDetailsPage";
import CourseEditPage from "@/pages/courses/CourseEditPage";

// Classrooms
import ClassroomsPage from "@/pages/classrooms/ClassroomsPage";
import AddClassroomPage from "@/pages/classrooms/AddClassroomPage";
import EditClassroomPage from "@/pages/classrooms/EditClassroomPage";

// Timetable
import TimetablePage from "@/pages/timetable/TimetablePage";
import AddTimetableEntryPage from "@/pages/timetable/AddTimetableEntryPage";

// Exams
import ExamsPage from "@/pages/exams/ExamsPage";
import AddExamPage from "@/pages/exams/AddExamPage";

// Fees
import FeesPage from "@/pages/fees/FeesPage";
import AddFeeStructurePage from "@/pages/fees/AddFeeStructurePage";
import MakePaymentPage from "@/pages/fees/MakePaymentPage";

// Settings
import SettingsPage from "@/pages/settings/SettingsPage";
import EnrollmentApprovalPage from "@/pages/settings/EnrollmentApprovalPage";

// Admin
import AdminProfilePage from "@/pages/admin/AdminProfilePage";
import ValidationRulesPage from "@/pages/admin/ValidationRulesPage";

// Announcements
import AnnouncementsPage from "@/pages/announcements/AnnouncementsPage";

// Teacher Module
import TeacherProfilePage from "@/pages/teacher/TeacherProfilePage";
import TeacherClassesPage from "@/pages/teacher/TeacherClassesPage";
import TeacherStudentsPage from "@/pages/teacher/TeacherStudentsPage";
import TeacherAssignmentsPage from "@/pages/teacher/TeacherAssignmentsPage";
import CreateAssignmentPage from "@/pages/teacher/CreateAssignmentPage";
import AssignmentDetailsPage from "@/pages/teacher/AssignmentDetailsPage";
import TeacherCommunicationPage from "@/pages/teacher/TeacherCommunicationPage";
import TeacherReportsPage from "@/pages/teacher/TeacherReportsPage";
import AttendancePage from "@/pages/teacher/AttendancePage";
import TeacherDoubtsPage from "@/pages/teacher/TeacherDoubtsPage";
import AttendanceRecordPage from "@/pages/teacher/AttendanceRecordPage";
import ExamReportsPage from "@/pages/teacher/ExamReportsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/login-success/student" element={<StudentLoginSuccessPage />} />
            <Route path="/login-success/teacher" element={<TeacherLoginSuccessPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Shell>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    
                    {/* Admin Routes - not accessible by teachers */}
                    <Route path="students/new" element={<AddStudentPage />} />
                    <Route path="teachers/new" element={<AddTeacherPage />} />
                    <Route path="courses/new" element={<AddCoursePage />} />
                    <Route path="courses/:courseId/edit" element={<CourseEditPage />} />
                    <Route path="classrooms/new" element={<AddClassroomPage />} />
                    <Route path="classrooms/:classroomId/edit" element={<EditClassroomPage />} />
                    <Route path="timetable/new" element={<AddTimetableEntryPage />} />
                    <Route path="exams/new" element={<AddExamPage />} />
                    <Route path="fees/new" element={<AddFeeStructurePage />} />
                    <Route path="admin/profile" element={<AdminProfilePage />} />
                    <Route path="admin/validation-rules" element={<ValidationRulesPage />} />
                    <Route path="settings/approvals" element={<EnrollmentApprovalPage />} />
                    
                    {/* Shared Routes - accessible by both admin and teacher */}
                    <Route path="students" element={<StudentsPage />} />
                    <Route path="teachers" element={<TeachersPage />} />
                    <Route path="courses" element={<CoursesPage />} />
                    <Route path="courses/:courseId" element={<CourseDetailsPage />} />
                    <Route path="classrooms" element={<ClassroomsPage />} />
                    <Route path="timetable" element={<TimetablePage />} />
                    <Route path="exams" element={<ExamsPage />} />
                    <Route path="fees" element={<FeesPage />} />
                    <Route path="fees/make-payment" element={<MakePaymentPage />} />
                    <Route path="announcements" element={<AnnouncementsPage />} />
                    
                    {/* Admin-only Settings - not for teachers */}
                    <Route path="settings" element={<SettingsPage />} />
                    
                    {/* Teacher Module Routes */}
                    <Route path="teacher/profile" element={<TeacherProfilePage />} />
                    <Route path="teacher/classes" element={<TeacherClassesPage />} />
                    <Route path="teacher/students" element={<TeacherStudentsPage />} />
                    <Route path="teacher/assignments" element={<TeacherAssignmentsPage />} />
                    <Route path="teacher/assignments/new" element={<CreateAssignmentPage />} />
                    <Route path="teacher/assignments/:assignmentId" element={<AssignmentDetailsPage />} />
                    <Route path="teacher/communication" element={<TeacherCommunicationPage />} />
                    <Route path="teacher/reports" element={<TeacherReportsPage />} />
                    <Route path="teacher/doubts" element={<TeacherDoubtsPage />} />
                    <Route path="teacher/attendance-records" element={<AttendanceRecordPage />} />
                    <Route path="teacher/exam-reports" element={<ExamReportsPage />} />
                    
                    {/* Aliases for easier navigation */}
                    <Route path="assignments/new" element={<CreateAssignmentPage />} />
                    <Route path="my-classes" element={<TeacherClassesPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="assignments" element={<TeacherAssignmentsPage />} />
                  </Routes>
                </Shell>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
