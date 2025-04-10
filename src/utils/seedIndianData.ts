
import { supabase } from "@/integrations/supabase/client";

interface Student {
  full_name: string;
  email: string;
  enrollment_number: string;
  date_of_birth: string;
  contact_number: string;
  address: string;
}

interface Teacher {
  full_name: string;
  email: string;
  employee_id: string;
  department: string;
  specialization: string;
  qualification: string;
  contact_number: string;
}

export const seedIndianDummyData = async () => {
  // Indian Names for students
  const indianStudents: Student[] = [
    {
      full_name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      enrollment_number: "S202301001",
      date_of_birth: "2000-05-15",
      contact_number: "9876543201",
      address: "123 MG Road, Bangalore"
    },
    {
      full_name: "Aditi Patel",
      email: "aditi.patel@example.com",
      enrollment_number: "S202301002",
      date_of_birth: "2001-07-22",
      contact_number: "9876543202",
      address: "456 Jubilee Hills, Hyderabad"
    },
    {
      full_name: "Arjun Verma",
      email: "arjun.verma@example.com",
      enrollment_number: "S202301003",
      date_of_birth: "2000-11-08",
      contact_number: "9876543203",
      address: "789 Connaught Place, Delhi"
    },
    {
      full_name: "Ishaan Mehta",
      email: "ishaan.mehta@example.com",
      enrollment_number: "S202301004",
      date_of_birth: "1999-03-25",
      contact_number: "9876543204",
      address: "234 Park Street, Kolkata"
    },
    {
      full_name: "Aanya Gupta",
      email: "aanya.gupta@example.com",
      enrollment_number: "S202301005",
      date_of_birth: "2001-09-12",
      contact_number: "9876543205",
      address: "567 Linking Road, Mumbai"
    },
    {
      full_name: "Vihaan Reddy",
      email: "vihaan.reddy@example.com",
      enrollment_number: "S202301006",
      date_of_birth: "2000-01-30",
      contact_number: "9876543206",
      address: "890 Koramangala, Bangalore"
    },
    {
      full_name: "Ananya Singh",
      email: "ananya.singh@example.com",
      enrollment_number: "S202301007",
      date_of_birth: "2001-04-18",
      contact_number: "9876543207",
      address: "123 Civil Lines, Allahabad"
    },
    {
      full_name: "Kabir Joshi",
      email: "kabir.joshi@example.com",
      enrollment_number: "S202301008",
      date_of_birth: "1999-08-07",
      contact_number: "9876543208",
      address: "456 Aundh, Pune"
    },
    {
      full_name: "Saanvi Kumar",
      email: "saanvi.kumar@example.com",
      enrollment_number: "S202301009",
      date_of_birth: "2000-12-05",
      contact_number: "9876543209",
      address: "789 Salt Lake, Kolkata"
    },
    {
      full_name: "Dhruv Malhotra",
      email: "dhruv.malhotra@example.com",
      enrollment_number: "S202301010",
      date_of_birth: "2001-02-15",
      contact_number: "9876543210",
      address: "234 Rajouri Garden, Delhi"
    }
  ];

  // Indian Teachers
  const indianTeachers: Teacher[] = [
    {
      full_name: "Dr. Rajesh Khanna",
      email: "rajesh.khanna@example.com",
      employee_id: "T202301001",
      department: "Computer Science",
      specialization: "Artificial Intelligence",
      qualification: "PhD in Computer Science",
      contact_number: "9876543101"
    },
    {
      full_name: "Prof. Meera Iyer",
      email: "meera.iyer@example.com",
      employee_id: "T202301002",
      department: "Mathematics",
      specialization: "Applied Mathematics",
      qualification: "PhD in Mathematics",
      contact_number: "9876543102"
    },
    {
      full_name: "Dr. Sunil Desai",
      email: "sunil.desai@example.com",
      employee_id: "T202301003",
      department: "Physics",
      specialization: "Quantum Physics",
      qualification: "PhD in Physics",
      contact_number: "9876543103"
    },
    {
      full_name: "Prof. Anjali Sharma",
      email: "anjali.sharma@example.com",
      employee_id: "T202301004",
      department: "Chemistry",
      specialization: "Organic Chemistry",
      qualification: "PhD in Chemistry",
      contact_number: "9876543104"
    },
    {
      full_name: "Dr. Vikram Rathore",
      email: "vikram.rathore@example.com",
      employee_id: "T202301005",
      department: "Electrical Engineering",
      specialization: "Power Systems",
      qualification: "PhD in Electrical Engineering",
      contact_number: "9876543105"
    }
  ];

  // Insert students
  for (const student of indianStudents) {
    // Create user first
    const { data: userData, error: userError } = await supabase.rpc('create_user_with_default_password', {
      p_email: student.email,
      p_full_name: student.full_name,
      p_role: 'student'
    });

    if (userError) {
      console.error(`Error creating student user ${student.full_name}:`, userError);
      continue;
    }

    // Update student profile with additional data
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .update({
        enrollment_number: student.enrollment_number,
        date_of_birth: student.date_of_birth,
        contact_number: student.contact_number,
        address: student.address,
        enrollment_status: 'approved',
        enrollment_date: new Date().toISOString(),
      })
      .eq('user_id', userData)
      .select();

    if (studentError) {
      console.error(`Error updating student profile for ${student.full_name}:`, studentError);
    }
  }

  // Insert teachers
  for (const teacher of indianTeachers) {
    // Create user first
    const { data: userData, error: userError } = await supabase.rpc('create_user_with_default_password', {
      p_email: teacher.email,
      p_full_name: teacher.full_name,
      p_role: 'teacher'
    });

    if (userError) {
      console.error(`Error creating teacher user ${teacher.full_name}:`, userError);
      continue;
    }

    // Update teacher profile with additional data
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .update({
        employee_id: teacher.employee_id,
        department: teacher.department,
        specialization: teacher.specialization,
        qualification: teacher.qualification,
        contact_number: teacher.contact_number,
        joining_date: new Date().toISOString().split('T')[0],
      })
      .eq('user_id', userData)
      .select();

    if (teacherError) {
      console.error(`Error updating teacher profile for ${teacher.full_name}:`, teacherError);
    }
  }

  // Insert courses
  const courses = [
    { name: "Computer Science Engineering", code: "CSE", credits: 160, description: "Bachelor's in Computer Science Engineering", duration: "4 years" },
    { name: "Electronics Engineering", code: "ECE", credits: 155, description: "Bachelor's in Electronics and Communication Engineering", duration: "4 years" },
    { name: "Mechanical Engineering", code: "ME", credits: 150, description: "Bachelor's in Mechanical Engineering", duration: "4 years" },
    { name: "Civil Engineering", code: "CE", credits: 150, description: "Bachelor's in Civil Engineering", duration: "4 years" },
    { name: "Information Technology", code: "IT", credits: 160, description: "Bachelor's in Information Technology", duration: "4 years" }
  ];

  for (const course of courses) {
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert([course])
      .select();

    if (courseError) {
      console.error(`Error creating course ${course.name}:`, courseError);
    }
  }

  // Get all courses
  const { data: allCourses, error: coursesError } = await supabase
    .from('courses')
    .select('*');

  if (coursesError) {
    console.error('Error fetching courses:', coursesError);
    return;
  }

  // Add subjects to courses
  for (const course of allCourses || []) {
    const subjects = [];
    
    // Add subjects based on course
    if (course.code === 'CSE' || course.code === 'IT') {
      subjects.push(
        { name: "Data Structures", code: `${course.code}101`, credits: 4, description: "Fundamentals of data structures", course_id: course.id },
        { name: "Algorithms", code: `${course.code}102`, credits: 4, description: "Algorithm design and analysis", course_id: course.id },
        { name: "Database Systems", code: `${course.code}201`, credits: 4, description: "Database concepts and SQL", course_id: course.id },
        { name: "Web Development", code: `${course.code}202`, credits: 3, description: "Web technologies and frameworks", course_id: course.id }
      );
    } else if (course.code === 'ECE') {
      subjects.push(
        { name: "Digital Electronics", code: `${course.code}101`, credits: 4, description: "Digital circuit design", course_id: course.id },
        { name: "Communication Systems", code: `${course.code}102`, credits: 4, description: "Principles of communication", course_id: course.id },
        { name: "Signal Processing", code: `${course.code}201`, credits: 4, description: "Digital signal processing", course_id: course.id },
        { name: "VLSI Design", code: `${course.code}202`, credits: 3, description: "Very large scale integration", course_id: course.id }
      );
    } else if (course.code === 'ME') {
      subjects.push(
        { name: "Thermodynamics", code: `${course.code}101`, credits: 4, description: "Laws of thermodynamics", course_id: course.id },
        { name: "Fluid Mechanics", code: `${course.code}102`, credits: 4, description: "Principles of fluid mechanics", course_id: course.id },
        { name: "Machine Design", code: `${course.code}201`, credits: 4, description: "Design of mechanical systems", course_id: course.id },
        { name: "Manufacturing Processes", code: `${course.code}202`, credits: 3, description: "Industrial manufacturing methods", course_id: course.id }
      );
    } else if (course.code === 'CE') {
      subjects.push(
        { name: "Structural Analysis", code: `${course.code}101`, credits: 4, description: "Analysis of structures", course_id: course.id },
        { name: "Geotechnical Engineering", code: `${course.code}102`, credits: 4, description: "Soil mechanics and foundations", course_id: course.id },
        { name: "Transportation Engineering", code: `${course.code}201`, credits: 4, description: "Design of transportation systems", course_id: course.id },
        { name: "Environmental Engineering", code: `${course.code}202`, credits: 3, description: "Environmental impact and sustainability", course_id: course.id }
      );
    }

    // Insert subjects
    for (const subject of subjects) {
      const { error: subjectError } = await supabase
        .from('subjects')
        .insert([subject]);

      if (subjectError) {
        console.error(`Error creating subject ${subject.name}:`, subjectError);
      }
    }
  }

  // Get all subjects
  const { data: allSubjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('*');

  if (subjectsError) {
    console.error('Error fetching subjects:', subjectsError);
    return;
  }

  // Get all teachers
  const { data: allTeachers, error: teachersError } = await supabase
    .from('teachers')
    .select('*');

  if (teachersError) {
    console.error('Error fetching teachers:', teachersError);
    return;
  }

  // Assign subjects to teachers based on department
  for (const teacher of allTeachers || []) {
    let subjectsToAssign = [];

    if (teacher.department === 'Computer Science') {
      subjectsToAssign = allSubjects?.filter(s => s.code.startsWith('CSE') || s.code.startsWith('IT')) || [];
    } else if (teacher.department === 'Electrical Engineering') {
      subjectsToAssign = allSubjects?.filter(s => s.code.startsWith('ECE')) || [];
    } else if (teacher.department === 'Physics') {
      subjectsToAssign = allSubjects?.filter(s => s.name.includes('Electronics') || s.name.includes('Signal')) || [];
    } else if (teacher.department === 'Mathematics') {
      subjectsToAssign = allSubjects?.filter(s => s.name.includes('Algorithms') || s.name.includes('Analysis')) || [];
    } else if (teacher.department === 'Chemistry') {
      subjectsToAssign = allSubjects?.filter(s => s.name.includes('Environmental') || s.name.includes('Materials')) || [];
    }

    // Limit to 2 subjects per teacher
    subjectsToAssign = subjectsToAssign.slice(0, 2);

    for (const subject of subjectsToAssign) {
      const { error: assignError } = await supabase
        .from('teacher_subjects')
        .insert([{
          teacher_id: teacher.id,
          subject_id: subject.id
        }]);

      if (assignError) {
        console.error(`Error assigning subject ${subject.name} to teacher ${teacher.id}:`, assignError);
      }
    }
  }

  // Get all students
  const { data: allStudents, error: studentsError } = await supabase
    .from('students')
    .select('*');

  if (studentsError) {
    console.error('Error fetching students:', studentsError);
    return;
  }

  // Assign students to courses and teachers
  for (const student of allStudents || []) {
    // Assign to a random course
    const randomCourse = allCourses?.[Math.floor(Math.random() * allCourses.length)];
    if (!randomCourse) continue;

    // Create enrollment
    const { error: enrollmentError } = await supabase
      .from('student_course_enrollments')
      .insert([{
        student_id: student.id,
        course_id: randomCourse.id,
        status: 'approved',
        academic_year: '2023-2024',
        semester: Math.floor(Math.random() * 6) + 1 // Semester 1-6
      }]);

    if (enrollmentError) {
      console.error(`Error enrolling student ${student.id} in course ${randomCourse.id}:`, enrollmentError);
    }

    // Assign to a teacher
    const randomTeacher = allTeachers?.[Math.floor(Math.random() * allTeachers.length)];
    if (!randomTeacher) continue;

    const { error: teacherStudentError } = await supabase
      .from('teacher_students')
      .insert([{
        teacher_id: randomTeacher.id,
        student_id: student.id
      }]);

    if (teacherStudentError) {
      console.error(`Error assigning student ${student.id} to teacher ${randomTeacher.id}:`, teacherStudentError);
    }
  }

  // Create classes/classrooms
  const classrooms = [
    { name: "A101", room: "Academic Block A, Room 101", capacity: 50 },
    { name: "A102", room: "Academic Block A, Room 102", capacity: 40 },
    { name: "B201", room: "Academic Block B, Room 201", capacity: 60 },
    { name: "B202", room: "Academic Block B, Room 202", capacity: 45 },
    { name: "C301", room: "Academic Block C, Room 301", capacity: 30 }
  ];

  for (const classroom of classrooms) {
    const { error: classroomError } = await supabase
      .from('classes')
      .insert([classroom]);

    if (classroomError) {
      console.error(`Error creating classroom ${classroom.name}:`, classroomError);
    }
  }

  // Create timetable entries
  const { data: allClassrooms, error: classroomsError } = await supabase
    .from('classes')
    .select('*');

  if (classroomsError) {
    console.error('Error fetching classrooms:', classroomsError);
    return;
  }

  // Create some timetable entries for teachers and subjects
  for (const teacher of allTeachers || []) {
    // Get subjects for this teacher
    const { data: teacherSubjects, error: teacherSubjectsError } = await supabase
      .from('teacher_subjects')
      .select('subject_id, subjects(*)')
      .eq('teacher_id', teacher.id);

    if (teacherSubjectsError) {
      console.error(`Error fetching subjects for teacher ${teacher.id}:`, teacherSubjectsError);
      continue;
    }

    for (const subject of teacherSubjects || []) {
      const randomClassroom = allClassrooms?.[Math.floor(Math.random() * allClassrooms.length)];
      if (!randomClassroom || !subject.subject_id) continue;

      // Create 2 timetable entries for each subject - different days
      const day1 = Math.floor(Math.random() * 5) + 1; // Monday to Friday (1-5)
      let day2 = day1;
      while (day2 === day1) {
        day2 = Math.floor(Math.random() * 5) + 1;
      }

      const timetableEntry1 = {
        subject_id: subject.subject_id,
        teacher_id: teacher.id,
        class_id: randomClassroom.id,
        day_of_week: day1,
        start_time: '09:00',
        end_time: '10:30'
      };

      const timetableEntry2 = {
        subject_id: subject.subject_id,
        teacher_id: teacher.id,
        class_id: randomClassroom.id,
        day_of_week: day2,
        start_time: '11:00',
        end_time: '12:30'
      };

      const { error: timetableError1 } = await supabase
        .from('timetable_entries')
        .insert([timetableEntry1]);

      if (timetableError1) {
        console.error(`Error creating timetable entry:`, timetableError1);
      }

      const { error: timetableError2 } = await supabase
        .from('timetable_entries')
        .insert([timetableEntry2]);

      if (timetableError2) {
        console.error(`Error creating timetable entry:`, timetableError2);
      }
    }
  }

  // Create attendance records
  for (const student of allStudents || []) {
    // Get the teacher assigned to this student
    const { data: teacherStudent, error: teacherStudentError } = await supabase
      .from('teacher_students')
      .select('teacher_id')
      .eq('student_id', student.id)
      .single();

    if (teacherStudentError) {
      console.error(`Error fetching teacher for student ${student.id}:`, teacherStudentError);
      continue;
    }

    if (!teacherStudent) continue;

    // Get subjects taught by this teacher
    const { data: teacherSubjects, error: teacherSubjectsError } = await supabase
      .from('teacher_subjects')
      .select('subject_id')
      .eq('teacher_id', teacherStudent.teacher_id);

    if (teacherSubjectsError || !teacherSubjects) {
      console.error(`Error fetching subjects for teacher ${teacherStudent.teacher_id}:`, teacherSubjectsError);
      continue;
    }

    for (const subject of teacherSubjects) {
      // Get timetable entries for this subject and teacher
      const { data: timetableEntries, error: timetableError } = await supabase
        .from('timetable_entries')
        .select('class_id')
        .eq('teacher_id', teacherStudent.teacher_id)
        .eq('subject_id', subject.subject_id)
        .limit(1);

      if (timetableError || !timetableEntries || timetableEntries.length === 0) {
        continue;
      }

      // Create attendance records for the last 10 days
      const today = new Date();
      for (let i = 1; i <= 10; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];

        // Randomly decide if present or absent (80% chance of present)
        const status = Math.random() < 0.8 ? 'present' : 'absent';

        const attendanceRecord = {
          date: formattedDate,
          student_id: student.id,
          teacher_id: teacherStudent.teacher_id,
          subject_id: subject.subject_id,
          class_id: timetableEntries[0].class_id,
          status: status,
          remarks: status === 'absent' ? 'Medical leave' : ''
        };

        const { error: attendanceError } = await supabase
          .from('attendance_records')
          .insert([attendanceRecord]);

        if (attendanceError) {
          console.error(`Error creating attendance record:`, attendanceError);
        }
      }
    }
  }

  console.log("Dummy data seeding completed");
  return { success: true, message: "Dummy data inserted successfully" };
};
