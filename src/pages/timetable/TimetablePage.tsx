
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Plus, 
  Clock, 
  User, 
  BookOpen, 
  MapPin,
  Filter,
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { format, parseISO, addDays, startOfWeek, endOfWeek } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/ui/page-header";
import { TimetableEntry, Class } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

const TimetablePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Query to fetch available classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching classes:", error);
          toast({
            title: "Error",
            description: "Failed to fetch classes. Please try again later.",
            variant: "destructive",
          });
          return [];
        }

        return data as Class[];
      } catch (error) {
        console.error("Error in fetch function:", error);
        return [];
      }
    },
  });

  // Query to fetch timetable entries
  const { data: timetableEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ["timetable", selectedClass, currentWeek],
    queryFn: async () => {
      try {
        let query = supabase
          .from('timetable_entries')
          .select(`
            *,
            class:classes(*),
            subject:subjects(*),
            teacher:teachers_view(*)
          `);

        if (selectedClass) {
          query = query.eq("class_id", selectedClass);
        } else if (user?.role === "teacher") {
          // For teachers, show only their classes
          const { data: teacherData } = await supabase
            .from('teachers')
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (teacherData) {
            query = query.eq("teacher_id", teacherData.id);
          }
        } else if (user?.role === "student") {
          // For students, show classes from their enrolled courses
          // This is a simplified example - in a real app, you'd need to join with enrollments
          const { data: studentData } = await supabase
            .from('students')
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (studentData) {
            // This would need to be customized based on your data model
            // to fetch timetable entries for the student's classes
          }
        }

        const { data, error } = await query.order("day_of_week").order("start_time");

        if (error) {
          console.error("Error fetching timetable entries:", error);
          toast({
            title: "Error",
            description: "Failed to fetch timetable data. Please try again later.",
            variant: "destructive",
          });
          return [];
        }

        return data as TimetableEntry[];
      } catch (error) {
        console.error("Error in fetch function:", error);
        return [];
      }
    },
    enabled: !classesLoading,
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  // Group entries by day and time for the timetable grid
  const getEntriesForDayAndTime = (day: number, timeSlot: string) => {
    if (!timetableEntries) return [];
    
    return timetableEntries.filter(entry => 
      entry.day_of_week === day && 
      entry.start_time <= timeSlot && 
      entry.end_time > timeSlot
    );
  };

  // Navigate to previous/next week
  const goToPreviousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  const isLoading = classesLoading || entriesLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable"
        description="View and manage class schedules"
        icon={Calendar}
      >
        {user?.role === "admin" && (
          <Button onClick={() => navigate("/timetable/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Schedule
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>
                Weekly timetable for all classes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </span>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="w-full md:w-64">
                <Select
                  value={selectedClass || ""}
                  onValueChange={(value) => setSelectedClass(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-institute-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-8 bg-gray-50">
                  <div className="p-3 text-xs font-medium text-gray-500 border-r">
                    Time / Day
                  </div>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <div key={day} className="p-3 text-xs font-medium text-gray-500 border-r last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                {TIME_SLOTS.map((timeSlot, timeIndex) => (
                  <div key={timeSlot} className="grid grid-cols-8 border-t">
                    <div className="p-3 text-xs font-medium text-gray-500 border-r bg-gray-50">
                      {timeSlot}
                    </div>
                    {DAYS_OF_WEEK.map((_, dayIndex) => {
                      const entries = getEntriesForDayAndTime(dayIndex + 1, timeSlot);
                      return (
                        <div key={`${dayIndex}-${timeIndex}`} className="p-1 border-r last:border-r-0 min-h-20">
                          {entries.map(entry => (
                            <div 
                              key={entry.id} 
                              className="bg-institute-100 rounded p-2 text-xs mb-1 overflow-hidden"
                            >
                              <div className="font-medium text-institute-600">
                                {entry.subject?.name}
                              </div>
                              <div className="flex items-center mt-1 text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>
                                  {entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}
                                </span>
                              </div>
                              <div className="flex items-center mt-1 text-gray-500">
                                <User className="h-3 w-3 mr-1" />
                                <span>{entry.teacher?.full_name}</span>
                              </div>
                              <div className="flex items-center mt-1 text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{entry.class?.room}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetablePage;
