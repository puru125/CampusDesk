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

// Settings/Approvals
import SettingsPage from "@/pages/settings/SettingsPage";
import EnrollmentApprovalPage from "@/pages/settings/EnrollmentApprovalPage";

// Admin
import AdminProfilePage from "@/pages/admin/AdminProfilePage";
import ValidationRulesPage from "@/pages/admin/ValidationRulesPage";
import AdminFeedbackPage from "@/pages/admin/AdminFeedbackPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";

// Announcements
import AnnouncementsPage from "@/pages/announcements/AnnouncementsPage";

// Teacher Module
import TeacherProfilePage from "@/pages/teacher/TeacherProfilePage";
import TeacherClassesPage from "@/pages/teacher/TeacherClassesPage";
import TeacherStudentsPage from "@/pages/teacher/TeacherStudentsPage";
import TeacherAddStudentPage from "@/pages/teacher/AddStudentPage";
import TeacherAssignmentsPage from "@/pages/teacher/TeacherAssignmentsPage";
import CreateAssignmentPage from "@/pages/teacher/CreateAssignmentPage";
import AssignmentDetailsPage from "@/pages/teacher/AssignmentDetailsPage";
import TeacherCommunicationPage from "@/pages/teacher/TeacherCommunicationPage";
import TeacherReportsPage from "@/pages/teacher/TeacherReportsPage";
import AttendancePage from "@/pages/teacher/AttendancePage";
import TeacherDoubtsPage from "@/pages/teacher/TeacherDoubtsPage";
import AttendanceRecordPage from "@/pages/teacher/AttendanceRecordPage";
import ExamReportsPage from "@/pages/teacher/ExamReportsPage";
import StudentIDCardPage from "@/pages/teacher/StudentIDCardPage";
import TeacherIDCardPage from "@/pages/teacher/TeacherIDCardPage";

// Student Module
import StudentCoursesPage from "@/pages/student/StudentCoursesPage";
import StudentAttendancePage from "@/pages/student/StudentAttendancePage";
import StudentAssignmentsPage from "@/pages/student/StudentAssignmentsPage";
import StudentExamsPage from "@/pages/student/StudentExamsPage";
import StudentFeedbackPage from "@/pages/student/StudentFeedbackPage";
import StudentNotificationsPage from "@/pages/student/StudentNotificationsPage";
import StudentProfilePage from "@/pages/student/StudentProfilePage";
import FeedbackSuccessPage from "@/components/student/FeedbackSuccessPage";
import StudentDoubtsPage from "@/pages/student/StudentDoubtsPage";
import AskDoubtPage from "@/pages/student/AskDoubtPage";
import StudentTimetablePage from "@/pages/student/StudentTimetablePage";
import StudentStudyMaterialsPage from "@/pages/student/StudentStudyMaterialsPage";
import ManageExamsPage from "@/pages/admin/ManageExamsPage";
import ExamDetailsPage from "@/pages/admin/ExamDetailsPage";
import ExamResultsPage from "@/pages/teacher/ExamReportsPage";

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
                    <Route path="admin/feedback" element={<AdminFeedbackPage />} />
                    <Route path="admin/analytics" element={<AnalyticsPage />} />
                    
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
                    <Route path="fees/structure/new" element={<AddFeeStructurePage />} />
                    <Route path="fees/structure/:id" element={<AddFeeStructurePage />} />
                    <Route path="announcements" element={<AnnouncementsPage />} />
                    
                    {/* Admin/Teacher settings */}
                    <Route path="approvals" element={<EnrollmentApprovalPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    
                    {/* Teacher Module Routes */}
                    <Route path="teacher/profile" element={<TeacherProfilePage />} />
                    <Route path="teacher/id-card" element={<TeacherIDCardPage />} />
                    <Route path="teacher/classes" element={<TeacherClassesPage />} />
                    <Route path="teacher/students" element={<TeacherStudentsPage />} />
                    <Route path="teacher/students/add" element={<TeacherAddStudentPage />} />
                    <Route path="teacher/students/:studentId/id-card" element={<StudentIDCardPage />} />
                    <Route path="teacher/assignments" element={<TeacherAssignmentsPage />} />
                    <Route path="teacher/assignments/new" element={<CreateAssignmentPage />} />
                    <Route path="teacher/assignments/:assignmentId" element={<AssignmentDetailsPage />} />
                    <Route path="teacher/communication" element={<TeacherCommunicationPage />} />
                    <Route path="teacher/reports" element={<TeacherReportsPage />} />
                    <Route path="teacher/doubts" element={<TeacherDoubtsPage />} />
                    <Route path="teacher/attendance-records" element={<AttendanceRecordPage />} />
                    <Route path="teacher/exam-reports" element={<ExamReportsPage />} />
                    
                    {/* Student Module Routes */}
                    <Route path="student/profile" element={<StudentProfilePage />} />
                    <Route path="student/courses" element={<StudentCoursesPage />} />
                    <Route path="student/attendance" element={<StudentAttendancePage />} />
                    <Route path="student/assignments" element={<StudentAssignmentsPage />} />
                    <Route path="student/exams" element={<StudentExamsPage />} />
                    <Route path="student/feedback" element={<StudentFeedbackPage />} />
                    <Route path="student/feedback/success" element={<FeedbackSuccessPage />} />
                    <Route path="student/notifications" element={<StudentNotificationsPage />} />
                    <Route path="student/doubts" element={<StudentDoubtsPage />} />
                    <Route path="student/doubts/ask" element={<AskDoubtPage />} />
                    <Route path="student/timetable" element={<StudentTimetablePage />} />
                    <Route path="student/study-materials" element={<StudentStudyMaterialsPage />} />
                    
                    {/* Aliases for easier navigation */}
                    <Route path="assignments/new" element={<CreateAssignmentPage />} />
                    <Route path="my-classes" element={<TeacherClassesPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="assignments" element={<TeacherAssignmentsPage />} />
                    <Route path="my-courses" element={<StudentCoursesPage />} />
                    <Route path="profile" element={<StudentProfilePage />} />
                    <Route path="fees/payment/new" element={<MakePaymentPage />} />
                    <Route path="doubts" element={<TeacherDoubtsPage />} />
                    <Route path="study-materials" element={<StudentStudyMaterialsPage />} />
                  
                    {/* Admin Routes */}
                    <Route path="admin/exams" element={<ManageExamsPage />} />
                    <Route path="admin/exams/:examId" element={<ExamDetailsPage />} />
                    <Route path="admin/exams/results" element={<ExamResultsPage />} />
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
