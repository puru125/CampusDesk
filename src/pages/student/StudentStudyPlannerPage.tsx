
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import StudyCalendar from "@/components/student/StudyCalendar";
import StudyPlanForm from "@/components/student/StudyPlanForm";
import StudyPlansList from "@/components/student/StudyPlansList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const StudentStudyPlannerPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchStudentId = async () => {
      if (!user) return;

      try {
        const { data, error } = await extendedSupabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setStudentId(data.id);
        }
      } catch (error) {
        console.error("Error fetching student id:", error);
        toast({
          title: "Error",
          description: "Failed to load student information",
          variant: "destructive",
        });
      }
    };

    fetchStudentId();
  }, [user]);

  const handleAddPlanSuccess = () => {
    setIsAddingPlan(false);
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Success",
      description: "Study plan has been added",
    });
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Study Planner</h1>
        <Button 
          onClick={() => setIsAddingPlan(true)} 
          disabled={isAddingPlan || !studentId}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Study Plan
        </Button>
      </div>

      {isAddingPlan && studentId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Study Plan</CardTitle>
            <CardDescription>Schedule your study time for better productivity</CardDescription>
          </CardHeader>
          <CardContent>
            <StudyPlanForm 
              studentId={studentId} 
              onSuccess={handleAddPlanSuccess}
              onCancel={() => setIsAddingPlan(false)}
            />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="calendar" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-0">
          {studentId && (
            <StudyCalendar 
              studentId={studentId} 
              refreshTrigger={refreshTrigger}
            />
          )}
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          {studentId && (
            <StudyPlansList 
              studentId={studentId} 
              refreshTrigger={refreshTrigger}
              onUpdateSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentStudyPlannerPage;
