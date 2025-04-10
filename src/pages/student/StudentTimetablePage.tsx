
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DAYS_OF_WEEK } from "@/components/timetable/TimetableFormConstants";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Calendar, Clock, School, Building, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentTimetableView } from "@/types/supabase-extensions";

// Our component's interface for timetable entries
interface TimetableEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  class_id: string;
  class_name: string;
  room: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  teacher_id: string;
  teacher_name: string;
}

const StudentTimetablePage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDay, setActiveDay] = useState(new Date().getDay() || 7); // Default to current day (0 = Sunday, 1-6 = Mon-Sat)
  
  // Convert Sunday (0) to 7 to match our day_of_week in database (1-7 where 1 is Monday)
  const adjustedActiveDay = activeDay === 0 ? 7 : activeDay;
  
  // Calculate the week dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  
  // Fetch student timetable data
  const { data: timetableEntries, isLoading } = useQuery({
    queryKey: ["student-timetable", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Query the student timetable view using the extended client that has the correct types
        const { data, error } = await extendedSupabase
          .from("student_timetable_view")
          .select("*")
          .order("day_of_week", { ascending: true })
          .order("start_time", { ascending: true });

        if (error) {
          console.error("Error fetching timetable:", error);
          return [];
        }

        // Explicitly cast the data to our expected type
        return data as TimetableEntry[];
      } catch (error) {
        console.error("Error in timetable query:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Filter entries for the selected day
  const dayEntries = timetableEntries?.filter(entry => entry.day_of_week === adjustedActiveDay) || [];

  // Navigate to previous day
  const handlePrevDay = () => {
    const newDay = activeDay === 1 ? 7 : activeDay - 1;
    setActiveDay(newDay);
  };

  // Navigate to next day
  const handleNextDay = () => {
    const newDay = activeDay === 7 ? 1 : activeDay + 1;
    setActiveDay(newDay);
  };

  // Get the full date for the current active day
  const getActiveDayDate = () => {
    // Adjust for our day_of_week mapping (1-7 where 1 is Monday)
    const dayOffset = activeDay === 7 ? 6 : activeDay - 1;
    return addDays(weekStart, dayOffset);
  };

  const activeDayDate = getActiveDayDate();
  const isToday = isSameDay(activeDayDate, new Date());

  return (
    <div>
      <PageHeader
        title="My Timetable"
        description="View your class schedule"
        icon={Calendar}
      />

      <div className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <CardTitle>Weekly Schedule</CardTitle>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Button variant="outline" size="icon" onClick={handlePrevDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex flex-col items-center">
                  <span className="font-medium">
                    {DAYS_OF_WEEK.find(day => day.value === adjustedActiveDay)?.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(activeDayDate, "d MMMM yyyy")}
                    {isToday && <Badge className="ml-2 bg-blue-500">Today</Badge>}
                  </span>
                </div>
                
                <Button variant="outline" size="icon" onClick={handleNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading timetable...</div>
            ) : dayEntries.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500">No classes scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dayEntries.map((entry) => (
                  <Card key={entry.id} className="overflow-hidden bg-gray-50 border shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{entry.subject_name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {entry.subject_code}
                          </Badge>
                          
                          <div className="mt-4 grid gap-2">
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{entry.start_time} - {entry.end_time}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <School className="h-4 w-4 mr-2" />
                              <span>Teacher: {entry.teacher_name}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Building className="h-4 w-4 mr-2" />
                              <span>
                                Classroom: {entry.class_name} (Room: {entry.room})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentTimetablePage;
