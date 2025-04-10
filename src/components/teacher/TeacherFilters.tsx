
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface TeacherFiltersProps {
  onFilterChange: (filters: {
    courseId?: string;
    academicYear?: string;
    semester?: string;
    performanceMetric?: string;
    performanceValue?: string;
  }) => void;
  courses: { id: string; name: string }[];
  showPerformanceFilters?: boolean;
}

const TeacherFilters = ({ 
  onFilterChange, 
  courses = [],
  showPerformanceFilters = false 
}: TeacherFiltersProps) => {
  const [courseId, setCourseId] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [performanceMetric, setPerformanceMetric] = useState<string>("");
  const [performanceValue, setPerformanceValue] = useState<string>("");

  const academicYears = ["2023-2024", "2022-2023", "2021-2022"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const performanceMetrics = ["attendance", "grades"];
  const attendanceRanges = ["Below 75%", "75% - 85%", "Above 85%"];
  const gradeRanges = ["Below 60%", "60% - 75%", "75% - 90%", "Above 90%"];

  const handleApplyFilters = () => {
    onFilterChange({
      courseId: courseId || undefined,
      academicYear: academicYear || undefined,
      semester: semester || undefined,
      performanceMetric: performanceMetric || undefined,
      performanceValue: performanceValue || undefined,
    });
  };

  const handleResetFilters = () => {
    setCourseId("");
    setAcademicYear("");
    setSemester("");
    setPerformanceMetric("");
    setPerformanceValue("");
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-md border shadow-sm mb-6">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-gray-500 mr-2" />
        <h3 className="text-sm font-medium">Filter Options</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Course/Class</label>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Academic Year</label>
          <Select value={academicYear} onValueChange={setAcademicYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Semester</label>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {showPerformanceFilters && (
          <>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Performance Metric</label>
              <Select value={performanceMetric} onValueChange={(value) => {
                setPerformanceMetric(value);
                setPerformanceValue(""); // Reset performance value when metric changes
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Metric" />
                </SelectTrigger>
                <SelectContent>
                  {performanceMetrics.map((metric) => (
                    <SelectItem key={metric} value={metric}>
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Performance Range</label>
              <Select 
                value={performanceValue} 
                onValueChange={setPerformanceValue}
                disabled={!performanceMetric}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                  {performanceMetric === 'attendance' ? 
                    attendanceRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    )) : 
                    performanceMetric === 'grades' ?
                    gradeRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    )) : null}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
      
      <div className="flex space-x-2 mt-4 justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleResetFilters}
          className="flex items-center"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
        <Button 
          size="sm" 
          onClick={handleApplyFilters}
          className="flex items-center"
        >
          <Filter className="h-4 w-4 mr-1" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default TeacherFilters;
