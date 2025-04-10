
import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "@/components/layout/Shell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import StudentProfilePage from "@/pages/student/StudentProfilePage";
import StudentCoursesPage from "@/pages/student/StudentCoursesPage";
import StudentTimetablePage from "@/pages/student/StudentTimetablePage";
import StudentAttendancePage from "@/pages/student/StudentAttendancePage";
import StudentExamsPage from "@/pages/student/StudentExamsPage";
import StudentNotificationsPage from "@/pages/student/StudentNotificationsPage";
import StudentDoubtsPage from "@/pages/student/StudentDoubtsPage";
import StudentFeedbackPage from "@/pages/student/StudentFeedbackPage";
import AskDoubtPage from "@/pages/student/AskDoubtPage";
import StudentLoginSuccessPage from "@/pages/dashboard/StudentLoginSuccessPage";
import TeacherLoginSuccessPage from "@/pages/dashboard/TeacherLoginSuccessPage";
import TeacherProfilePage from "@/pages/teacher/TeacherProfilePage";
import TeacherCommunicationPage from "@/pages/teacher/TeacherCommunicationPage";
import TeacherStudentsPage from "@/pages/teacher/TeacherStudentsPage";
import TeacherDoubtsPage from "@/pages/teacher/TeacherDoubtsPage";
import TeacherClassesPage from "@/pages/teacher/TeacherClassesPage";
import TeacherNotificationsPage from "@/pages/teacher/TeacherNotificationsPage";
import TeacherAssignmentsPage from "@/pages/teacher/TeacherAssignmentsPage";
import TeacherReportsPage from "@/pages/teacher/TeacherReportsPage";
import TeacherIDCardPage from "@/pages/teacher/TeacherIDCardPage";
import ExamReportsPage from "@/pages/teacher/ExamReportsPage";
import AddStudentPage from "@/pages/teacher/AddStudentPage";
import CreateAssignmentPage from "@/pages/teacher/CreateAssignmentPage";
import AssignmentDetailsPage from "@/pages/teacher/AssignmentDetailsPage";
import AttendancePage from "@/pages/teacher/AttendancePage";
import AttendanceRecordPage from "@/pages/teacher/AttendanceRecordPage";
import StudentsPage from "@/pages/students/StudentsPage";
import AddStudentPage as AdminAddStudentPage from "@/pages/students/AddStudentPage";
import TeachersPage from "@/pages/teachers/TeachersPage";
import AddTeacherPage from "@/pages/teachers/AddTeacherPage";
import CoursesPage from "@/pages/courses/CoursesPage";
import AddCoursePage from "@/pages/courses/AddCoursePage";
import CourseDetailsPage from "@/pages/courses/CourseDetailsPage";
import CourseEditPage from "@/pages/courses/CourseEditPage";
import ClassroomsPage from "@/pages/classrooms/ClassroomsPage";
import AddClassroomPage from "@/pages/classrooms/AddClassroomPage";
import EditClassroomPage from "@/pages/classrooms/EditClassroomPage";
import EnrollmentApprovalPage from "@/pages/settings/EnrollmentApprovalPage";
import ExamsPage from "@/pages/exams/ExamsPage";
import AddExamPage from "@/pages/exams/AddExamPage";
import FeesPage from "@/pages/fees/FeesPage";
import AddFeeStructurePage from "@/pages/fees/AddFeeStructurePage";
import MakePaymentPage from "@/pages/fees/MakePaymentPage";
import TimetablePage from "@/pages/timetable/TimetablePage";
import AddTimetableEntryPage from "@/pages/timetable/AddTimetableEntryPage";
import AnnouncementsPage from "@/pages/announcements/AnnouncementsPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import ValidationRulesPage from "@/pages/admin/ValidationRulesPage";
import AdminNotificationsPage from "@/pages/admin/AdminNotificationsPage";
import AdminProfilePage from "@/pages/admin/AdminProfilePage";
import AdminFeedbackPage from "@/pages/admin/AdminFeedbackPage";
import PasswordReset from "@/components/auth/PasswordReset";
import FeedbackSuccessPage from "@/components/student/FeedbackSuccessPage";
import StudentIDCard from "@/components/student/StudentIDCard";

function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          
          {/* Student Routes */}
          <Route path="/student/login-success" element={<StudentLoginSuccessPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/courses" element={<StudentCoursesPage />} />
          <Route path="/student/timetable" element={<StudentTimetablePage />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />
          <Route path="/student/exams" element={<StudentExamsPage />} />
          <Route path="/student/notifications" element={<StudentNotificationsPage />} />
          <Route path="/student/doubts" element={<StudentDoubtsPage />} />
          <Route path="/student/ask-doubt" element={<AskDoubtPage />} />
          <Route path="/student/feedback" element={<StudentFeedbackPage />} />
          <Route path="/student/feedback-success" element={<FeedbackSuccessPage />} />
          <Route path="/student/id-card" element={<StudentIDCard />} />
          
          {/* Teacher Routes */}
          <Route path="/teacher/login-success" element={<TeacherLoginSuccessPage />} />
          <Route path="/teacher/profile" element={<TeacherProfilePage />} />
          <Route path="/teacher/id-card" element={<TeacherIDCardPage />} />
          <Route path="/teacher/communication" element={<TeacherCommunicationPage />} />
          <Route path="/teacher/students" element={<TeacherStudentsPage />} />
          <Route path="/teacher/doubts" element={<TeacherDoubtsPage />} />
          <Route path="/teacher/classes" element={<TeacherClassesPage />} />
          <Route path="/teacher/notifications" element={<TeacherNotificationsPage />} />
          <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
          <Route path="/teacher/reports" element={<TeacherReportsPage />} />
          <Route path="/teacher/exam-reports" element={<ExamReportsPage />} />
          <Route path="/teacher/add-student" element={<AddStudentPage />} />
          <Route path="/teacher/create-assignment" element={<CreateAssignmentPage />} />
          <Route path="/teacher/assignment/:id" element={<AssignmentDetailsPage />} />
          <Route path="/teacher/attendance" element={<AttendancePage />} />
          <Route path="/teacher/attendance/:id" element={<AttendanceRecordPage />} />
          
          {/* Admin Routes */}
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/new" element={<AdminAddStudentPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/teachers/new" element={<AddTeacherPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/new" element={<AddCoursePage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/courses/:id/edit" element={<CourseEditPage />} />
          <Route path="/classrooms" element={<ClassroomsPage />} />
          <Route path="/classrooms/new" element={<AddClassroomPage />} />
          <Route path="/classrooms/:id/edit" element={<EditClassroomPage />} />
          <Route path="/enrollments/approvals" element={<EnrollmentApprovalPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/exams/new" element={<AddExamPage />} />
          <Route path="/fees" element={<FeesPage />} />
          <Route path="/fees/new" element={<AddFeeStructurePage />} />
          <Route path="/fees/pay/:id" element={<MakePaymentPage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/timetable/new" element={<AddTimetableEntryPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/notifications" element={<AdminNotificationsPage />} />
          <Route path="/profile" element={<AdminProfilePage />} />
          <Route path="/feedback" element={<AdminFeedbackPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/roles" element={<ValidationRulesPage />} />
        </Route>
        
        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Shell>
  );
}

export default App;
