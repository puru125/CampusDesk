
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/page-header";
import { TimetableDataProvider } from "@/components/timetable/TimetableDataProvider";
import { TimetableEntryForm } from "@/components/timetable/TimetableEntryForm";

const AddTimetableEntryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Timetable Entry"
        description="Create a new timetable entry"
        icon={Calendar}
      >
        <Button variant="outline" onClick={() => navigate("/timetable")}>
          Cancel
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Timetable Details</CardTitle>
          <CardDescription>
            Enter the details for the new timetable entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimetableDataProvider>
            {({ classes, subjects, teachers, isLoading }) => (
              isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-institute-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <TimetableEntryForm
                  classes={classes}
                  subjects={subjects}
                  teachers={teachers}
                  onCancel={() => navigate("/timetable")}
                  onSuccess={() => navigate("/timetable")}
                />
              )
            )}
          </TimetableDataProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTimetableEntryPage;
