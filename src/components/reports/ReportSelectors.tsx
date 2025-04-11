
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Student {
  id: string;
  name: string;
  enrollment: string;
}

interface ReportSelectorsProps {
  courses: Course[];
  students: Student[];
  selectedCourse: string;
  setSelectedCourse: (value: string) => void;
  selectedStudent: string;
  setSelectedStudent: (value: string) => void;
  coursesLoading?: boolean;
  studentsLoading?: boolean;
}

const ReportSelectors = ({
  courses,
  students,
  selectedCourse,
  setSelectedCourse,
  selectedStudent,
  setSelectedStudent,
  coursesLoading,
  studentsLoading
}: ReportSelectorsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mt-6 mb-6">
      <div className="w-64">
        <Select 
          value={selectedCourse} 
          onValueChange={setSelectedCourse}
          disabled={coursesLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.name} ({course.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedCourse && selectedCourse !== "all" && (
        <div className="w-64">
          <Select 
            value={selectedStudent} 
            onValueChange={setSelectedStudent}
            disabled={studentsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} ({student.enrollment})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default ReportSelectors;
