
import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
// Remove the CSS import that might be causing issues
// import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent } from "@/components/ui/card";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import StudyPlanForm from "./StudyPlanForm";
import { Button } from "@/components/ui/button";
import { Check, Clock, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Add basic calendar styles inline to avoid CSS loading issues
const calendarStyles = `
  .rbc-calendar {
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  
  .rbc-btn-group {
    display: inline-flex;
    margin-bottom: 10px;
  }
  
  .rbc-btn-group button {
    margin: 0;
    padding: 5px 10px;
    border: 1px solid #ccc;
    background: white;
  }
  
  .rbc-btn-group button:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  
  .rbc-btn-group button:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  
  .rbc-toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-size: 16px;
  }
  
  .rbc-toolbar-label {
    flex-grow: 1;
    text-align: center;
    font-weight: bold;
  }
  
  .rbc-header {
    font-weight: bold;
    padding: 10px 3px;
    text-align: center;
    border-bottom: 1px solid #ddd;
  }
  
  .rbc-event {
    padding: 2px 5px;
    background-color: #3174ad;
    color: white;
    border-radius: 5px;
    font-size: 12px;
    cursor: pointer;
  }
`;

interface StudyPlan {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  color?: string;
  is_completed: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color?: string;
  isCompleted: boolean;
  resource: StudyPlan;
}

interface StudyCalendarProps {
  studentId: string;
  refreshTrigger: number;
}

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const StudyCalendar = ({ studentId, refreshTrigger }: StudyCalendarProps) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Add this to inject the custom calendar styles
  useEffect(() => {
    // Create a style element and inject the CSS
    const styleEl = document.createElement('style');
    styleEl.innerHTML = calendarStyles;
    document.head.appendChild(styleEl);

    // Clean up when component unmounts
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  useEffect(() => {
    fetchStudyPlans();
  }, [studentId, refreshTrigger]);

  const fetchStudyPlans = async () => {
    setLoading(true);
    try {
      console.log("Fetching study plans for student:", studentId);
      const { data, error } = await extendedSupabase
        .from("student_study_plans")
        .select("*")
        .eq("student_id", studentId)
        .order("start_time", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        console.log("Study plans fetched:", data.length);
        // Convert to calendar events
        const calendarEvents: CalendarEvent[] = data.map((plan: StudyPlan) => ({
          id: plan.id,
          title: plan.title,
          start: new Date(plan.start_time),
          end: new Date(plan.end_time),
          description: plan.description,
          color: plan.color,
          isCompleted: plan.is_completed,
          resource: plan,
        }));

        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error("Error fetching study plans:", error);
      toast({
        title: "Error",
        description: "Failed to load study plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleEditPlan = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeletePlan = () => {
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleMarkComplete = async (completed: boolean) => {
    if (!selectedEvent) return;

    try {
      const { error } = await extendedSupabase
        .from("student_study_plans")
        .update({ is_completed: completed })
        .eq("id", selectedEvent.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Study plan marked as ${completed ? "completed" : "incomplete"}`,
      });

      setIsViewModalOpen(false);
      fetchStudyPlans();
    } catch (error) {
      console.error("Error updating study plan:", error);
      toast({
        title: "Error",
        description: "Failed to update study plan status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;

    try {
      const { error } = await extendedSupabase
        .from("student_study_plans")
        .delete()
        .eq("id", selectedEvent.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Study plan deleted successfully",
      });

      setIsDeleteModalOpen(false);
      fetchStudyPlans();
    } catch (error) {
      console.error("Error deleting study plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete study plan",
        variant: "destructive",
      });
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    fetchStudyPlans();
    toast({
      title: "Success",
      description: "Study plan updated successfully",
    });
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: event.color || "#4CAF50",
      borderRadius: "5px",
      opacity: event.isCompleted ? 0.6 : 0.8,
      color: "white",
      border: "none",
      display: "block",
      textDecoration: event.isCompleted ? "line-through" : "none",
    };
    return {
      style,
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("Rendering calendar with events:", events.length);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="h-[70vh]">
            {/* Add a try-catch for the Calendar component */}
            {(() => {
              try {
                return (
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    popup
                    views={["month", "week", "day", "agenda"]}
                  />
                );
              } catch (error) {
                console.error("Error rendering calendar:", error);
                return (
                  <div className="flex items-center justify-center h-full border border-dashed border-gray-300 rounded-md p-8">
                    <div className="text-center">
                      <p className="text-red-500 mb-4">Failed to load calendar</p>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                      >
                        Reload page
                      </Button>
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        </CardContent>
      </Card>

      {/* View Event Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedEvent?.isCompleted && (
                <span className="mr-2 text-green-500">
                  <Check size={18} />
                </span>
              )}
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && (
                <div className="mt-2 space-y-3">
                  {selectedEvent.description && (
                    <p className="text-sm">{selectedEvent.description}</p>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock size={14} className="mr-1" />
                    <span>
                      {format(selectedEvent.start, "E, MMM d, yyyy")} | {format(selectedEvent.start, "h:mm a")} - {format(selectedEvent.end, "h:mm a")}
                    </span>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-between mt-4">
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleMarkComplete(!selectedEvent?.isCompleted)}>
                {selectedEvent?.isCompleted ? "Mark Incomplete" : "Mark Complete"}
              </Button>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={handleEditPlan}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeletePlan}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Study Plan</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <StudyPlanForm
              studentId={studentId}
              initialData={selectedEvent.resource}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this study plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StudyCalendar;
