
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { format } from "date-fns";

// Extend jsPDF with autoTable but with a proper type declaration
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: { finalY: number };
  }
}

// Define interfaces for report data
interface TeacherInfo {
  name: string;
  employeeId: string;
}

interface CourseInfo {
  id: string;
  name: string;
  code: string;
}

interface StudentInfo {
  id: string;
  name: string;
  enrollment: string;
}

interface AttendanceData {
  name: string;
  present: number;
  absent: number;
  total: number;
}

interface PerformanceData {
  name: string;
  average: number;
  highest: number;
  lowest: number;
  maxScore: number;
}

export interface FinancialData {
  year?: string;
  session?: string;
  financialData?: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    status: string;
    students?: {
      enrollment_number: string;
      users?: {
        full_name: string;
      };
    };
    fee_structures?: {
      fee_type: string;
      description?: string;
    };
  }>;
}

// Main function to generate PDF reports
export const generateReportPDF = (
  reportType: string,
  teacherInfo: TeacherInfo,
  courseInfo: CourseInfo | null,
  studentInfo: StudentInfo | null,
  attendanceData?: AttendanceData[],
  performanceData?: PerformanceData[],
  studentPerformance?: any,
  financialData?: FinancialData
) => {
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = format(new Date(), "dd MMM yyyy");
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 128);
  doc.text("School Management System", pageWidth / 2, 20, { align: "center" });
  
  // Add report title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  const reportTitle = getReportTitle(reportType);
  doc.text(reportTitle, pageWidth / 2, 30, { align: "center" });
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${today}`, pageWidth - 15, 10, { align: "right" });
  
  // Add teacher info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generated by: ${teacherInfo.name}`, 15, 45);
  doc.text(`Employee ID: ${teacherInfo.employeeId}`, 15, 52);
  
  // Add course and student info if available
  let yPos = 60;
  if (courseInfo) {
    doc.text(`Course: ${courseInfo.name} (${courseInfo.code})`, 15, yPos);
    yPos += 7;
  }
  
  if (studentInfo) {
    doc.text(`Student: ${studentInfo.name} (${studentInfo.enrollment})`, 15, yPos);
    yPos += 7;
  }
  
  // Add financial filters if available
  if (reportType === 'financial' && financialData) {
    if (financialData.year) {
      doc.text(`Year: ${financialData.year}`, 15, yPos);
      yPos += 7;
    }
    
    if (financialData.session) {
      doc.text(`Session: ${financialData.session}`, 15, yPos);
      yPos += 7;
    }
  }
  
  // Add report-specific content
  yPos += 10;
  
  if (reportType === 'attendance' && attendanceData) {
    addAttendanceReport(doc, attendanceData, yPos);
  } else if (reportType === 'performance' && performanceData) {
    addPerformanceReport(doc, performanceData, yPos);
  } else if (reportType === 'financial' && financialData) {
    addFinancialReport(doc, financialData, yPos);
  } else if (reportType === 'student' && studentPerformance) {
    addStudentReport(doc, studentPerformance, studentInfo, yPos);
  }
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }
  
  return doc;
};

// Helper function to get report title
const getReportTitle = (reportType: string): string => {
  switch (reportType) {
    case 'attendance':
      return 'Attendance Report';
    case 'performance':
      return 'Performance Analysis Report';
    case 'financial':
      return 'Financial Report';
    case 'student':
      return 'Student Overview Report';
    default:
      return 'Report';
  }
};

// Add attendance report content
const addAttendanceReport = (doc: jsPDF, data: AttendanceData[], startY: number) => {
  doc.text('Attendance Summary', 15, startY);
  
  // Create table data
  const tableData = data.map(item => [
    item.name,
    item.present.toString(),
    item.absent.toString(),
    item.total.toString(),
    `${((item.present / item.total) * 100).toFixed(1)}%`
  ]);
  
  // Add table
  doc.autoTable({
    startY: startY + 10,
    head: [['Period', 'Present', 'Absent', 'Total Classes', 'Attendance %']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 51, 102], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });
  
  // Add summary
  const totalPresent = data.reduce((sum, item) => sum + item.present, 0);
  const totalClasses = data.reduce((sum, item) => sum + item.total, 0);
  const overallAttendance = totalClasses > 0 
    ? ((totalPresent / totalClasses) * 100).toFixed(1) 
    : '0';
  
  const tableEnd = doc.lastAutoTable.finalY + 10;
  doc.text(`Overall Attendance: ${overallAttendance}%`, 15, tableEnd);
  
  // Add recommendations based on attendance
  const attendancePercent = parseFloat(overallAttendance);
  let recommendation = '';
  
  if (attendancePercent >= 90) {
    recommendation = 'Excellent attendance record. Keep it up!';
  } else if (attendancePercent >= 75) {
    recommendation = 'Good attendance record. Try to improve further.';
  } else if (attendancePercent >= 60) {
    recommendation = 'Average attendance. Needs improvement.';
  } else {
    recommendation = 'Poor attendance. Immediate improvement required.';
  }
  
  doc.text('Recommendation:', 15, tableEnd + 10);
  doc.text(recommendation, 15, tableEnd + 20);
};

// Add performance report content
const addPerformanceReport = (doc: jsPDF, data: PerformanceData[], startY: number) => {
  doc.text('Performance Summary', 15, startY);
  
  // Create table data
  const tableData = data.map(item => [
    item.name,
    item.average.toString(),
    item.highest.toString(),
    item.lowest.toString(),
    item.maxScore.toString(),
    `${((item.average / item.maxScore) * 100).toFixed(1)}%`
  ]);
  
  // Add table
  doc.autoTable({
    startY: startY + 10,
    head: [['Assignment', 'Average Score', 'Highest', 'Lowest', 'Max Score', 'Performance %']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 102, 51], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });
  
  // Add summary
  const averageScores = data.map(item => (item.average / item.maxScore) * 100);
  const overallPerformance = averageScores.length > 0
    ? (averageScores.reduce((a, b) => a + b, 0) / averageScores.length).toFixed(1)
    : '0';
  
  const tableEnd = doc.lastAutoTable.finalY + 10;
  doc.text(`Overall Performance: ${overallPerformance}%`, 15, tableEnd);
  
  // Add recommendations based on performance
  const performancePercent = parseFloat(overallPerformance);
  let recommendation = '';
  
  if (performancePercent >= 90) {
    recommendation = 'Excellent performance. Keep up the good work!';
  } else if (performancePercent >= 75) {
    recommendation = 'Good performance. Continue to work hard.';
  } else if (performancePercent >= 60) {
    recommendation = 'Average performance. More effort needed.';
  } else {
    recommendation = 'Below average performance. Significant improvement required.';
  }
  
  doc.text('Recommendation:', 15, tableEnd + 10);
  doc.text(recommendation, 15, tableEnd + 20);
};

// Add financial report content
const addFinancialReport = (doc: jsPDF, data: FinancialData, startY: number) => {
  doc.text('Financial Summary', 15, startY);
  
  // Process financial data if available
  if (data.financialData && data.financialData.length > 0) {
    // Group by month
    const monthlyData = new Map();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize months
    months.forEach(month => {
      monthlyData.set(month, { revenue: 0, count: 0 });
    });
    
    // Aggregate data
    data.financialData.forEach(transaction => {
      const date = new Date(transaction.payment_date);
      const monthName = months[date.getMonth()];
      const monthData = monthlyData.get(monthName);
      
      monthData.revenue += Number(transaction.amount);
      monthData.count += 1;
    });
    
    // Create table data for monthly summary
    const tableData = Array.from(monthlyData.entries())
      .map(([month, data]) => [
        month,
        data.count.toString(),
        `₹${data.revenue.toLocaleString('en-IN')}`,
      ]);
    
    // Add monthly summary table
    doc.autoTable({
      startY: startY + 10,
      head: [['Month', 'Transactions', 'Revenue']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 102], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    
    // Calculate totals
    const totalRevenue = Array.from(monthlyData.values())
      .reduce((sum, data) => sum + data.revenue, 0);
    const totalTransactions = Array.from(monthlyData.values())
      .reduce((sum, data) => sum + data.count, 0);
    
    const tableEnd = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`, 15, tableEnd);
    doc.text(`Total Transactions: ${totalTransactions}`, 15, tableEnd + 7);
    
    // Add recent transactions table
    if (data.financialData.length > 0) {
      doc.text('Recent Transactions', 15, tableEnd + 20);
      
      // Get the 10 most recent transactions
      const recentTransactions = [...data.financialData]
        .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
        .slice(0, 10);
      
      const transactionTableData = recentTransactions.map(tx => [
        tx.id.substring(0, 8),
        format(new Date(tx.payment_date), 'dd MMM yyyy'),
        tx.students?.users?.full_name || 'Unknown',
        `₹${Number(tx.amount).toLocaleString('en-IN')}`,
        tx.payment_method,
        tx.status
      ]);
      
      // Add transactions table
      doc.autoTable({
        startY: tableEnd + 30,
        head: [['ID', 'Date', 'Student', 'Amount', 'Method', 'Status']],
        body: transactionTableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 102], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });
    }
  } else {
    // No data available
    doc.text('No financial data available for the selected period.', 15, startY + 10);
  }
};

// Add student report content
const addStudentReport = (doc: jsPDF, data: any, studentInfo: StudentInfo | null, startY: number) => {
  if (!studentInfo) {
    doc.text('No student selected.', 15, startY + 10);
    return;
  }
  
  // Add attendance summary
  doc.text('Attendance Summary', 15, startY);
  doc.text(`Total Classes: ${data.attendance.total}`, 15, startY + 10);
  doc.text(`Present: ${data.attendance.present}`, 15, startY + 17);
  doc.text(`Attendance Percentage: ${data.attendance.percentage}%`, 15, startY + 24);
  
  // Add assignment scores
  doc.text('Assignment Scores', 15, startY + 40);
  
  if (data.assignments && data.assignments.length > 0) {
    const assignmentData = data.assignments.map((assignment: any) => [
      assignment.title,
      assignment.score.toString(),
      assignment.maxScore.toString(),
      `${assignment.percentage.toFixed(1)}%`
    ]);
    
    // Add assignments table
    doc.autoTable({
      startY: startY + 50,
      head: [['Assignment', 'Score', 'Max Score', 'Percentage']],
      body: assignmentData,
      theme: 'grid',
      headStyles: { fillColor: [102, 0, 102], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    
    // Calculate average performance
    const averagePerformance = data.assignments
      .reduce((sum: number, assignment: any) => sum + assignment.percentage, 0) / data.assignments.length;
    
    const tableEnd = doc.lastAutoTable.finalY + 10;
    doc.text(`Average Performance: ${averagePerformance.toFixed(1)}%`, 15, tableEnd);
    
    // Add overall assessment
    doc.text('Overall Assessment', 15, tableEnd + 20);
    
    let attendanceComment = '';
    const attendancePercent = parseFloat(data.attendance.percentage);
    
    if (attendancePercent >= 90) {
      attendanceComment = 'Excellent attendance';
    } else if (attendancePercent >= 75) {
      attendanceComment = 'Good attendance';
    } else if (attendancePercent >= 60) {
      attendanceComment = 'Average attendance';
    } else {
      attendanceComment = 'Poor attendance';
    }
    
    let performanceComment = '';
    if (averagePerformance >= 90) {
      performanceComment = 'Excellent academic performance';
    } else if (averagePerformance >= 75) {
      performanceComment = 'Good academic performance';
    } else if (averagePerformance >= 60) {
      performanceComment = 'Average academic performance';
    } else {
      performanceComment = 'Below average academic performance';
    }
    
    doc.text(`• ${attendanceComment}`, 15, tableEnd + 30);
    doc.text(`• ${performanceComment}`, 15, tableEnd + 37);
    
    // Add recommendations
    doc.text('Recommendations', 15, tableEnd + 50);
    
    if (attendancePercent < 75) {
      doc.text('• Improve class attendance', 15, tableEnd + 60);
    }
    
    if (averagePerformance < 70) {
      doc.text('• Focus on improving assignment scores', 15, tableEnd + 67);
      doc.text('• Consider additional tutoring or study groups', 15, tableEnd + 74);
    }
    
    if (attendancePercent >= 75 && averagePerformance >= 70) {
      doc.text('• Continue with current study habits', 15, tableEnd + 60);
      doc.text('• Consider participating in advanced learning opportunities', 15, tableEnd + 67);
    }
  } else {
    doc.text('No assignment data available.', 15, startY + 50);
  }
};
