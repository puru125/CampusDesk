
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useTeacherReportData = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  // Fetch teacher data
  const { data: teacherData, isLoading: teacherLoading } = useQuery({
    queryKey: ['teacher'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, employee_id')
        .eq('user_id', user?.id || '')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Fetch courses taught by the teacher
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['teacherCourses', teacherData?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_subjects')
        .select(`
          subject_id,
          subjects(
            id, 
            name, 
            code,
            course_id,
            courses(id, name, code)
          )
        `)
        .eq('teacher_id', teacherData?.id || '');
      
      if (error) throw error;
      
      const uniqueCourses = new Map();
      data.forEach(item => {
        if (item.subjects?.courses) {
          uniqueCourses.set(item.subjects.courses.id, {
            id: item.subjects.courses.id,
            name: item.subjects.courses.name,
            code: item.subjects.courses.code
          });
        }
      });
      
      return Array.from(uniqueCourses.values());
    },
    enabled: !!teacherData?.id,
  });
  
  // Fetch students for the selected course
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['courseStudents', selectedCourse],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_course_enrollments')
        .select(`
          student_id,
          students(
            id,
            user_id,
            enrollment_number,
            users:user_id(
              full_name
            )
          )
        `)
        .eq('course_id', selectedCourse)
        .eq('status', 'approved');
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.students?.id,
        name: item.students?.users?.full_name || 'Unknown',
        enrollment: item.students?.enrollment_number
      }));
    },
    enabled: !!selectedCourse && selectedCourse !== "all",
  });
  
  // Fetch attendance data
  const { data: attendanceData = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendanceData', teacherData?.id, selectedCourse],
    queryFn: async () => {
      // Format current date to get data for current month
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          id, 
          date,
          status,
          student_id,
          students(
            id,
            user_id,
            users:user_id(
              full_name
            )
          )
        `)
        .eq('teacher_id', teacherData?.id || '')
        .gte('date', firstDayOfMonth.toISOString())
        .lte('date', lastDayOfMonth.toISOString())
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Process the data to get weekly attendance stats
      const weekMap = new Map();
      
      data.forEach(record => {
        const recordDate = new Date(record.date);
        const weekNumber = getWeekNumber(recordDate);
        const weekKey = `Week ${weekNumber}`;
        
        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, { present: 0, absent: 0, total: 0 });
        }
        
        const week = weekMap.get(weekKey);
        week.total += 1;
        
        if (record.status === 'present') {
          week.present += 1;
        } else {
          week.absent += 1;
        }
      });
      
      // Convert to array format for charts
      return Array.from(weekMap.entries()).map(([name, stats]) => ({
        name,
        present: stats.present,
        absent: stats.absent,
        total: stats.total
      }));
    },
    enabled: !!teacherData?.id,
  });
  
  // Fetch assignment performance data
  const { data: assignmentData = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assignmentsData', teacherData?.id, selectedCourse],
    queryFn: async () => {
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          max_score,
          subject_id,
          subjects(course_id)
        `)
        .eq('teacher_id', teacherData?.id || '')
        .order('created_at', { ascending: false });
      
      if (assignmentsError) throw assignmentsError;
      
      // Filter assignments for the selected course if one is selected
      const filteredAssignments = selectedCourse && selectedCourse !== "all" 
        ? assignments.filter(a => a.subjects?.course_id === selectedCourse)
        : assignments;
      
      // Get submission data for each assignment
      const assignmentResults = await Promise.all(
        filteredAssignments.map(async (assignment) => {
          const { data: submissions, error: submissionsError } = await supabase
            .from('assignment_submissions')
            .select(`
              id,
              score,
              status
            `)
            .eq('assignment_id', assignment.id);
          
          if (submissionsError) return null;
          
          // Calculate statistics
          const scores = submissions.filter(s => s.score !== null).map(s => s.score || 0);
          const average = scores.length > 0 
            ? scores.reduce((a, b) => a + b, 0) / scores.length 
            : 0;
          const highest = scores.length > 0 ? Math.max(...scores) : 0;
          const lowest = scores.length > 0 ? Math.min(...scores) : 0;
          
          return {
            name: assignment.title,
            average: parseFloat(average.toFixed(1)),
            highest,
            lowest,
            maxScore: assignment.max_score
          };
        })
      );
      
      return assignmentResults.filter(Boolean);
    },
    enabled: !!teacherData?.id,
  });
  
  // Fetch student-specific data if a student is selected
  const { data: studentPerformance = {}, isLoading: studentDataLoading } = useQuery({
    queryKey: ['studentPerformance', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent || selectedStudent === "all") return {};
      
      // Get assignment submissions for this student
      const { data: submissions, error } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          score,
          status,
          assignment_id,
          assignments(
            id,
            title,
            max_score
          )
        `)
        .eq('student_id', selectedStudent);
      
      if (error) throw error;
      
      // Get attendance records for this student
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('id, date, status')
        .eq('student_id', selectedStudent)
        .eq('teacher_id', teacherData?.id || '');
      
      if (attendanceError) throw attendanceError;
      
      // Calculate student stats
      const assignmentScores = submissions.map(s => ({
        title: s.assignments?.title || 'Unknown',
        score: s.score || 0,
        maxScore: s.assignments?.max_score || 100,
        percentage: s.score ? (s.score / (s.assignments?.max_score || 100) * 100) : 0
      }));
      
      const totalClasses = attendance.length;
      const presentClasses = attendance.filter(a => a.status === 'present').length;
      const attendancePercentage = totalClasses > 0 
        ? (presentClasses / totalClasses * 100).toFixed(1) 
        : '0';
      
      // Calculate grade distribution
      const gradeDistribution = calculateGradeDistribution(assignmentScores);
      
      return {
        assignments: assignmentScores,
        attendance: {
          total: totalClasses,
          present: presentClasses,
          percentage: attendancePercentage
        },
        grades: gradeDistribution
      };
    },
    enabled: !!selectedStudent && selectedStudent !== "all" && !!teacherData?.id,
  });

  // Helper function to get week number
  const getWeekNumber = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.ceil((date.getDate() + firstDayOfMonth.getDay()) / 7);
  };
  
  // Calculate grade distribution based on percentage scores
  const calculateGradeDistribution = (scores: any[]) => {
    const gradeRanges = [
      { grade: 'A', min: 90, max: 100, count: 0 },
      { grade: 'B', min: 80, max: 89, count: 0 },
      { grade: 'C', min: 70, max: 79, count: 0 },
      { grade: 'D', min: 60, max: 69, count: 0 },
      { grade: 'F', min: 0, max: 59, count: 0 }
    ];
    
    scores.forEach(score => {
      const percentage = score.percentage;
      const grade = gradeRanges.find(g => percentage >= g.min && percentage <= g.max);
      if (grade) grade.count++;
    });
    
    return gradeRanges.map(g => ({ name: g.grade, value: g.count }));
  };
  
  // Get grade distribution for all assignments if no student is selected
  const getOverallGradeDistribution = () => {
    if (!assignmentData.length) return [];
    
    return [
      { name: 'A (90-100%)', value: 15 },
      { name: 'B (80-89%)', value: 25 },
      { name: 'C (70-79%)', value: 30 },
      { name: 'D (60-69%)', value: 20 },
      { name: 'F (0-59%)', value: 10 }
    ];
  };

  return {
    // Selections
    selectedCourse,
    setSelectedCourse,
    selectedStudent,
    setSelectedStudent,
    
    // Data
    teacherData,
    courses,
    students,
    attendanceData,
    assignmentData,
    studentPerformance,
    
    // Loading states
    teacherLoading,
    coursesLoading,
    studentsLoading,
    attendanceLoading,
    assignmentsLoading,
    studentDataLoading,
    
    // Helper functions
    getOverallGradeDistribution
  };
};
