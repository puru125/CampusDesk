
import React, { useState, useEffect } from "react";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Calendar, Clock, MoreVertical, Edit, Trash2 } from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import StudyPlanForm from "./StudyPlanForm";

interface StudyPlan {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  color?: string;
  is_completed: boolean;
}

interface StudyPlansListProps {
  studentId: string;
  refreshTrigger: number;
  onUpdateSuccess: () => void;
}

const StudyPlansList = ({ 
  studentId, 
  refreshTrigger,
  onUpdateSuccess 
}: StudyPlansListProps) => {
  const { toast } = useToast();
  const [studies, setStudies] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<StudyPlan | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'overdue'>('all');

  useEffect(() => {
    fetchStudyPlans();
  }, [studentId, refreshTrigger]);

  const fetchStudyPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await extendedSupabase
        .from("student_study_plans")
        .select("*")
        .eq("student_id", studentId)
        .order("start_time", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setStudies(data);
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

  const handleToggleComplete = async (plan: StudyPlan) => {
    try {
      const { error } = await extendedSupabase
        .from("student_study_plans")
        .update({ is_completed: !plan.is_completed })
        .eq("id", plan.id);

      if (error) {
        throw error;
      }

      setStudies(studies.map(s => s.id === plan.id ? { ...s, is_completed: !plan.is_completed } : s));
      onUpdateSuccess();
    } catch (error) {
      console.error("Error updating study plan:", error);
      toast({
        title: "Error",
        description: "Failed to update study plan status",
        variant: "destructive",
      });
    }
  };

  const handleEditPlan = (plan: StudyPlan) => {
    setEditingPlan(plan);
    setIsEditDialogOpen(true);
  };

  const handleDeletePlan = (plan: StudyPlan) => {
    setDeletingPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingPlan) return;

    try {
      const { error } = await extendedSupabase
        .from("student_study_plans")
        .delete()
        .eq("id", deletingPlan.id);

      if (error) {
        throw error;
      }

      setStudies(studies.filter(s => s.id !== deletingPlan.id));
      toast({
        title: "Success",
        description: "Study plan deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
      onUpdateSuccess();
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
    setIsEditDialogOpen(false);
    fetchStudyPlans();
    onUpdateSuccess();
  };

  const getRelativeTimeLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  const isOverdue = (plan: StudyPlan) => {
    return !plan.is_completed && isPast(new Date(plan.end_time));
  };

  const getFilteredPlans = () => {
    switch (filter) {
      case 'upcoming':
        return studies.filter(plan => !plan.is_completed && !isOverdue(plan));
      case 'completed':
        return studies.filter(plan => plan.is_completed);
      case 'overdue':
        return studies.filter(plan => isOverdue(plan));
      default:
        return studies;
    }
  };

  const filteredPlans = getFilteredPlans();

  // Group studies by date
  const groupedPlans: Record<string, StudyPlan[]> = {};
  
  filteredPlans.forEach(plan => {
    const date = new Date(plan.start_time).toDateString();
    if (!groupedPlans[date]) {
      groupedPlans[date] = [];
    }
    groupedPlans[date].push(plan);
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'upcoming' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </Button>
            <Button 
              variant={filter === 'completed' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
            <Button 
              variant={filter === 'overdue' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter('overdue')}
            >
              Overdue
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''}
          </div>
        </div>

        {Object.keys(groupedPlans).length === 0 ? (
          <Card>
            <CardContent className="p-10 flex flex-col items-center justify-center">
              <h3 className="text-lg font-medium">No study plans found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === 'all' 
                  ? "You haven't created any study plans yet." 
                  : `No ${filter} plans to display.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.keys(groupedPlans).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map(date => (
            <Card key={date}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  {getRelativeTimeLabel(date)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupedPlans[date].map(plan => (
                    <div
                      key={plan.id}
                      className={`flex items-start p-3 border rounded-md ${
                        isOverdue(plan) ? 'border-red-200 bg-red-50' : 
                        plan.is_completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      }`}
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: plan.color || '#4CAF50',
                      }}
                    >
                      <Checkbox
                        checked={plan.is_completed}
                        onCheckedChange={() => handleToggleComplete(plan)}
                        className="mt-1"
                      />
                      <div className="ml-3 flex-1">
                        <h4 className={`font-medium ${plan.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                          {plan.title}
                        </h4>
                        {plan.description && (
                          <p className={`text-sm mt-1 ${plan.is_completed ? 'text-muted-foreground line-through' : ''}`}>
                            {plan.description}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <Clock size={12} className="mr-1" />
                          <span>
                            {format(new Date(plan.start_time), "h:mm a")} - {format(new Date(plan.end_time), "h:mm a")}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePlan(plan)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Study Plan</DialogTitle>
          </DialogHeader>
          {editingPlan && (
            <StudyPlanForm
              studentId={studentId}
              initialData={editingPlan}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this study plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StudyPlansList;
