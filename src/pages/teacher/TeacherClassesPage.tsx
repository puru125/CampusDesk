
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School, Users, BookOpen, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

const TeacherClassesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        if (!user) return;
        
        // Get teacher profile
        const { data: teacherProfile, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (teacherError) throw teacherError;
        
        setTeacherData(teacherProfile);
        
        // Get assigned subjects with course info
        const { data: teacherSubjects, error: subjectsError } = await supabase
          .from('teacher_subjects')
          .select(`
            subject_id,
            subjects(
              id,
              name,
              code,
              description,
              credits,
              course_id,
              courses(
                id,
                name,
                code,
                description,
                credits
              )
            )
          `)
          .eq('teacher_id', teacherProfile.id);
          
        if (subjectsError) throw subjectsError;
        
        // Format courses data
        const coursesMap = new Map();
        teacherSubjects?.forEach(ts => {
          const course = ts.subjects?.courses;
          const subject = ts.subjects;
          
          if (course && subject) {
            if (!coursesMap.has(course.id)) {
              coursesMap.set(course.id, {
                ...course,
                subjects: [subject]
              });
            } else {
              const existingCourse = coursesMap.get(course.id);
              existingCourse.subjects.push(subject);
              coursesMap.set(course.id, existingCourse);
            }
          }
        });
        
        setCourses(Array.from(coursesMap.values()));
        
        // Get timetable entries for classes
        const { data: timetableEntries, error: timetableError } = await supabase
          .from('timetable_entries')
          .select(`
            id,
            day_of_week,
            start_time,
            end_time,
            subjects(id, name, code),
            classes(id, name, room, capacity)
          `)
          .eq('teacher_id', teacherProfile.id)
          .order('day_of_week')
          .order('start_time');
          
        if (timetableError) throw timetableError;
        
        // Format classes data
        const classesData = timetableEntries?.map(entry => ({
          id: entry.id,
          day: getDayName(entry.day_of_week),
          dayNumber: entry.day_of_week,
          time: `${entry.start_time} - ${entry.end_time}`,
          startTime: entry.start_time,
          endTime: entry.end_time,
          subject: entry.subjects?.name || 'Unknown Subject',
          subjectCode: entry.subjects?.code || '',
          room: entry.classes?.room || 'TBD',
          capacity: entry.classes?.capacity || 0,
        })) || [];
        
        setClasses(classesData);
      } catch (error) {
        console.error("Error fetching teacher classes:", error);
        toast({
          title: "Error",
          description: "Failed to fetch class data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherClasses();
  }, [user, toast]);

  // Helper functions
  const getDayName = (dayNumber: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNumber - 1] || 'Unknown';
  };
  
  // Group classes by day
  const classesByDay = classes.reduce((acc, cls) => {
    if (!acc[cls.dayNumber]) {
      acc[cls.dayNumber] = [];
    }
    acc[cls.dayNumber].push(cls);
    return acc;
  }, {} as Record<number, any[]>);
  
  return (
    <div>
      <PageHeader
        title="My Classes"
        description="View your assigned courses and class schedule"
        icon={School}
      />
      
      <Tabs defaultValue="schedule" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="schedule" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Class Schedule
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            My Courses
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 gap-6">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[...Array(3)].map((_, idx) => (
                          <div key={idx} className="h-20 bg-gray-100 rounded"></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : Object.keys(classesByDay).length > 0 ? (
              Object.entries(classesByDay)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([day, dayClasses]) => (
                  <Card key={day}>
                    <CardHeader>
                      <CardTitle className="text-lg">{getDayName(Number(day))}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dayClasses.map((cls) => (
                          <div key={cls.id} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">
                                  {cls.subject} {cls.subjectCode && <span className="text-gray-500 text-sm ml-2">({cls.subjectCode})</span>}
                                </h3>
                                <div className="flex items-center mt-2 text-sm text-gray-500 space-x-3">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{cls.time}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span>Room {cls.room}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    <span>{cls.capacity} students</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="text-center py-12">
                <School className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No Classes Scheduled</h3>
                <p className="mt-1 text-gray-500">
                  You don't have any classes scheduled at the moment.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="courses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-institute-600" />
                      {course.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {course.description || "No description available"}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Course Code:</span>
                        <span>{course.code || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Credits:</span>
                        <span>{course.credits || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Subjects:</span>
                        <span>{course.subjects?.length || 0}</span>
                      </div>
                    </div>
                    
                    {course.subjects && course.subjects.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Teaching Subjects:</h4>
                        <ul className="space-y-1 text-sm">
                          {course.subjects.map((subject: any) => (
                            <li key={subject.id} className="flex justify-between">
                              <span>{subject.name}</span>
                              <span className="text-gray-500">{subject.code || "No code"}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No Courses Assigned</h3>
                <p className="mt-1 text-gray-500">
                  You don't have any courses assigned to you yet.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherClassesPage;
