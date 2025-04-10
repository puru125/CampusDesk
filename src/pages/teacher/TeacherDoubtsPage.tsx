
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import PageHeader from "@/components/ui/page-header";
import { StudentDoubtsCard, StudentDoubt } from "@/components/teacher/StudentDoubtsCard";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoubtDetailsModal from "@/components/teacher/DoubtDetailsModal";

const TeacherDoubtsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDoubt, setSelectedDoubt] = useState<StudentDoubt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch teacher ID
  const { data: teacherData } = useQuery({
    queryKey: ["teacher-id", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await extendedSupabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch doubts assigned to this teacher
  const { data: doubts, isLoading } = useQuery({
    queryKey: ["teacher-doubts", teacherData?.id, refreshKey],
    queryFn: async () => {
      if (!teacherData?.id) return [];
      
      const { data, error } = await extendedSupabase
        .from("student_doubts")
        .select(`
          *,
          subjects (
            name,
            code
          ),
          students (
            user_id,
            users (
              full_name
            )
          )
        `)
        .eq("teacher_id", teacherData.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching doubts:", error);
        return [];
      }
      return data as StudentDoubt[];
    },
    enabled: !!teacherData?.id,
  });

  const filteredDoubts = doubts?.filter(doubt => {
    if (activeTab === "all") return true;
    return doubt.status === activeTab;
  });
  
  const handleViewDoubt = (doubt: StudentDoubt) => {
    setSelectedDoubt(doubt);
    setIsModalOpen(true);
  };

  const handleStatusChange = () => {
    // Trigger a refresh of the doubts data
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <div>
      <PageHeader
        title="Student Doubts"
        description="View and answer student questions"
        icon={HelpCircle}
      >
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </PageHeader>
      
      <div className="mt-6">
        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="answered">Answered</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="text-center py-8">Loading student doubts...</div>
            ) : filteredDoubts?.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500">No student doubts found</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDoubts?.map(doubt => (
                  <StudentDoubtsCard 
                    key={doubt.id} 
                    doubt={doubt} 
                    onViewClick={handleViewDoubt} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <DoubtDetailsModal
        doubt={selectedDoubt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default TeacherDoubtsPage;
