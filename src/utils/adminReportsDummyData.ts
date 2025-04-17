
import { addDays, subDays, startOfMonth, format } from "date-fns";

// Generate dates for the current month
const generateMonthDates = (date: Date) => {
  const start = startOfMonth(date);
  const days = [];
  for (let i = 0; i < 30; i++) {
    days.push(format(addDays(start, i), 'MMM dd'));
  }
  return days;
};

// Generate random financial data
export const generateFinancialData = (selectedDate: Date) => {
  const monthDays = generateMonthDates(selectedDate);
  
  const monthlySummary = monthDays.map(day => ({
    day,
    income: Math.floor(Math.random() * 10000) + 5000,
    expenses: Math.floor(Math.random() * 5000) + 2000
  }));

  const transactions = Array.from({ length: 5 }, (_, i) => ({
    id: `tr-${i}`,
    date: format(subDays(new Date(), i), 'MMM dd, yyyy'),
    student: `Student ${i + 1}`,
    amount: Math.floor(Math.random() * 5000) + 1000,
    paymentMethod: ['Credit Card', 'Cash', 'Bank Transfer'][Math.floor(Math.random() * 3)],
    status: ['completed', 'pending', 'completed'][Math.floor(Math.random() * 3)]
  }));

  return {
    monthlySummary,
    recentTransactions: transactions,
    stats: {
      totalRevenue: 150000,
      pendingPayments: 25000,
      revenueGrowth: 12.5
    }
  };
};

// Generate random attendance data
export const generateAttendanceData = () => {
  return Array.from({ length: 4 }, (_, weekIndex) => ({
    name: `Week ${weekIndex + 1}`,
    present: Math.floor(Math.random() * 40) + 60, // 60-100 students present
    absent: Math.floor(Math.random() * 20) + 5,   // 5-25 students absent
    total: 100 // Total class size
  }));
};

// Generate random performance data
export const generatePerformanceData = () => {
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'History'];
  
  return subjects.map(subject => ({
    name: subject,
    average: Math.floor(Math.random() * 20) + 70, // 70-90 average score
    highest: Math.floor(Math.random() * 10) + 90, // 90-100 highest score
    lowest: Math.floor(Math.random() * 20) + 40,  // 40-60 lowest score
    maxScore: 100
  }));
};
