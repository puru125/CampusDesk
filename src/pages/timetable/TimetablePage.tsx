
import { useNavigate } from "react-router-dom";
import { Calendar, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/ui/page-header";
import { useAuth } from "@/contexts/AuthContext";
import { useTimetableData } from "@/hooks/useTimetableData";
import TimetableFilters from "@/components/timetable/TimetableFilters";
import TimetableGrid from "@/components/timetable/TimetableGrid";
import WeekNavigation from "@/components/timetable/WeekNavigation";

const TimetablePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    classes,
    timetableEntries,
    selectedClass,
    setSelectedClass,
    weekStart,
    weekEnd,
    goToPreviousWeek,
    goToNextWeek,
    isLoading
  } = useTimetableData();

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
            <WeekNavigation 
              weekStart={weekStart}
              weekEnd={weekEnd}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
            />
          </div>
        </CardHeader>
        <CardContent>
          <TimetableFilters 
            classes={classes}
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
          />
          <TimetableGrid 
            timetableEntries={timetableEntries}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetablePage;
