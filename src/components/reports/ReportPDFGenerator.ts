
import jsPDF from "jspdf";
import "jspdf/dist/polyfills.es.js";

interface TeacherInfo {
  name: string;
  employeeId: string;
}

interface CourseInfo {
  name: string;
}

interface StudentInfo {
  name: string;
  enrollment: string;
}

interface AttendanceData {
  name: string;
  present: number;
  absent: number;
}

interface AssignmentData {
  name: string;
  average: number;
  highest: number;
  lowest: number;
}

interface StudentPerformance {
  attendance?: {
    total: number;
    present: number;
    percentage: string;
  };
  assignments?: Array<{
    title: string;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
  grades?: Array<{
    name: string;
    value: number;
  }>;
}

export const generateReportPDF = (
  reportType: string,
  teacherInfo: TeacherInfo,
  courseInfo?: CourseInfo | null,
  studentInfo?: StudentInfo | null,
  attendanceData?: AttendanceData[],
  assignmentData?: AssignmentData[],
  studentPerformance?: StudentPerformance
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  doc.setFontSize(18);
  doc.text(`Teacher Report: ${reportType}`, 20, 20);
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Add teacher info
  doc.text(`Teacher: ${teacherInfo.name || 'N/A'}`, 20, 40);
  doc.text(`Employee ID: ${teacherInfo.employeeId || 'N/A'}`, 20, 50);
  
  // Add course info if selected
  if (courseInfo) {
    doc.text(`Course: ${courseInfo.name || 'N/A'}`, 20, 60);
  }
  
  // Add student info if selected
  if (studentInfo) {
    doc.text(`Student: ${studentInfo.name || 'N/A'}`, 20, 70);
    doc.text(`Enrollment: ${studentInfo.enrollment || 'N/A'}`, 20, 80);
  }
  
  // Add report data based on type
  const yStart = studentInfo ? 90 : 70;
  
  if (reportType === 'attendance') {
    doc.text('Attendance Summary:', 20, yStart);
    
    if (studentInfo && studentPerformance?.attendance) {
      // Student-specific attendance
      doc.text(`Total Classes: ${studentPerformance.attendance.total || 0}`, 20, yStart + 10);
      doc.text(`Present: ${studentPerformance.attendance.present || 0}`, 20, yStart + 20);
      doc.text(`Attendance Rate: ${studentPerformance.attendance.percentage || 0}%`, 20, yStart + 30);
    } else if (attendanceData) {
      // Overall attendance
      attendanceData.forEach((week, index) => {
        doc.text(`${week.name}: Present: ${week.present}, Absent: ${week.absent}`, 20, yStart + (index * 10));
      });
    }
  } else if (reportType === 'performance') {
    doc.text('Performance Summary:', 20, yStart);
    
    if (studentInfo && studentPerformance?.assignments) {
      // Student-specific performance
      doc.text('Assignment Scores:', 20, yStart + 10);
      
      studentPerformance.assignments.forEach((assignment, index) => {
        doc.text(`${assignment.title}: ${assignment.score}/${assignment.maxScore} (${assignment.percentage.toFixed(1)}%)`, 
          20, yStart + 20 + (index * 10));
      });
    } else if (assignmentData) {
      // Overall performance
      assignmentData.forEach((assignment, index) => {
        doc.text(`${assignment.name}: Avg: ${assignment.average}, High: ${assignment.highest}, Low: ${assignment.lowest}`,
          20, yStart + 10 + (index * 10));
      });
    }
  } else if (reportType === 'grades') {
    doc.text('Grade Distribution:', 20, yStart);
    
    const grades = studentInfo && studentPerformance?.grades 
      ? studentPerformance.grades 
      : [
          { name: 'A (90-100%)', value: 15 },
          { name: 'B (80-89%)', value: 25 },
          { name: 'C (70-79%)', value: 30 },
          { name: 'D (60-69%)', value: 20 },
          { name: 'F (0-59%)', value: 10 }
        ];
    
    grades.forEach((grade, index) => {
      doc.text(`${grade.name}: ${grade.value} students`, 20, yStart + 10 + (index * 10));
    });
  }
  
  return doc;
};
