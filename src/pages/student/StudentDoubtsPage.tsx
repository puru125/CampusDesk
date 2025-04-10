
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { HelpCircle, Plus, Circle, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Subject {
  name: string;
  code: string;
}

interface Doubt {
  id: string;
  title: string;
  question: string;
  status: string;
  created_at: string;
  subject_id?: string;
  subject?: Subject | null;
}

const StudentDoubtsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch student ID
  const { data: studentData } = useQuery({
    queryKey: ["student-id", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await extendedSupabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch doubts for the student
  const { data: doubts, isLoading } = useQuery({
    queryKey: ["student-doubts", studentData?.id],
    queryFn: async () => {
      if (!studentData?.id) return [];
      
      try {
        // First fetch the student doubts
        const { data, error } = await extendedSupabase
          .from("student_doubts")
          .select(`
            id,
            title,
            question,
            status,
            created_at,
            subject_id
          `)
          .eq("student_id", studentData.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching doubts:", error);
          return [];
        }

        // If there are no doubts, return empty array
        if (!data || data.length === 0) return [];

        // Get all subject IDs that exist in the doubts
        const subjectIds = data
          .filter(doubt => doubt.subject_id)
          .map(doubt => doubt.subject_id);

        // Fetch subject details separately if there are any subject IDs
        let subjects = [];
        if (subjectIds.length > 0) {
          const subjectsResponse = await extendedSupabase
            .from("subjects")
            .select("id, name, code")
            .in("id", subjectIds);

          if (subjectsResponse.error) {
            console.error("Error fetching subjects:", subjectsResponse.error);
          } else {
            subjects = subjectsResponse.data || [];
          }
        }

        // Combine the data
        return data.map(doubt => {
          const subject = doubt.subject_id 
            ? subjects.find(s => s.id === doubt.subject_id) 
            : null;
          
          return {
            ...doubt,
            subject: subject ? { name: subject.name, code: subject.code } : null
          };
        });
      } catch (error) {
        console.error("Error in doubts query:", error);
        return [];
      }
    },
    enabled: !!studentData?.id,
  });

  const filteredDoubts = doubts?.filter(doubt => {
    if (activeTab === "all") return true;
    return doubt.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "answered":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleAddDoubt = () => {
    navigate("/student/doubts/ask");
  };

  return (
    <div>
      <PageHeader
        title="My Doubts"
        description="Track your questions and their responses"
        icon={HelpCircle}
      >
        <Button onClick={handleAddDoubt}>
          <Plus className="mr-2 h-4 w-4" />
          Ask a Doubt
        </Button>
      </PageHeader>

      <div className="mt-6">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="answered">Answered</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="text-center py-8">Loading your doubts...</div>
            ) : filteredDoubts?.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500">No doubts found</p>
                {activeTab === "all" && (
                  <Button variant="outline" className="mt-4" onClick={handleAddDoubt}>
                    Ask a New Doubt
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDoubts?.map((doubt) => (
                  <Card key={doubt.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg line-clamp-1">{doubt.title}</h3>
                        <Badge variant="outline" className="ml-2 shrink-0">
                          <Circle className={`h-2 w-2 mr-1 ${getStatusColor(doubt.status)}`} />
                          {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">{doubt.question}</p>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>
                          {doubt.subject?.name ? 
                            `${doubt.subject.name} (${doubt.subject.code})` : 
                            "General Question"}
                        </span>
                        <span>
                          {format(new Date(doubt.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      
                      {doubt.status === "answered" && (
                        <div className="mt-3 pt-3 border-t">
                          <h4 className="font-medium text-sm mb-1">Teacher Response:</h4>
                          <p className="text-sm text-gray-700">
                            {/* This would fetch the answer from doubt_answers */}
                            This will show the teacher's response once implemented
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDoubtsPage;
