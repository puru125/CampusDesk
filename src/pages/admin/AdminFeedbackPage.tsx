
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { MessageSquare, Star, FileText } from "lucide-react";

interface Feedback {
  id: string;
  created_at: string;
  student_id: string;
  title: string;
  message: string;
  rating: number;
  is_read: boolean;
  student_name?: string;
}

const AdminFeedbackPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch all feedback
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ["admin-feedbacks"],
    queryFn: async () => {
      // Join with profiles to get student names
      // First, get all feedback entries
      const { data: feedbackData, error: feedbackError } = await extendedSupabase
        .from("student_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (feedbackError) throw feedbackError;
      
      // For each feedback entry, get the student name
      const feedbackWithNames = await Promise.all((feedbackData || []).map(async (feedback) => {
        if (!feedback) {
          return {
            id: '',
            created_at: '',
            student_id: '',
            title: '',
            message: '',
            rating: 0,
            is_read: false,
            student_name: 'Unknown Student'
          } as Feedback;
        }
        
        // Get student name from students table
        const { data: studentData } = await extendedSupabase
          .from("students_view")
          .select("full_name")
          .eq("id", feedback.student_id)
          .single();
          
        return {
          id: feedback.id ? String(feedback.id) : '',
          created_at: feedback.created_at ? String(feedback.created_at) : '',
          student_id: feedback.student_id ? String(feedback.student_id) : '',
          title: feedback.title ? String(feedback.title) : '',
          message: feedback.message ? String(feedback.message) : '',
          rating: typeof feedback.rating === 'number' ? feedback.rating : 0,
          is_read: feedback.is_read === true,
          student_name: studentData?.full_name || "Unknown Student"
        } as Feedback;
      }));
      
      return feedbackWithNames;
    },
  });

  const filteredFeedbacks = feedbacks?.filter(feedback => {
    if (activeTab === "all") return true;
    return activeTab === "unread" ? !feedback.is_read : feedback.is_read;
  });

  const markAsRead = async (id: string) => {
    try {
      await extendedSupabase
        .from("student_feedback")
        .update({ is_read: true })
        .eq("id", id);
    } catch (error) {
      console.error("Error marking feedback as read:", error);
    }
  };

  const renderStars = (rating: number) => {
    const normalizedRating = Math.min(5, Math.max(0, Math.round(rating / 2))); // Convert 10-scale to 5-scale
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star 
          key={i} 
          className={`h-4 w-4 ${i < normalizedRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
        />
      ));
  };

  return (
    <div>
      <PageHeader
        title="Student Feedback"
        description="Review feedback submitted by students"
        icon={MessageSquare}
      />

      <div className="mt-6">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Feedback</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="text-center py-8">Loading feedback...</div>
            ) : filteredFeedbacks?.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500">No feedback found</p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredFeedbacks?.map((feedback) => (
                  <Card 
                    key={feedback.id} 
                    className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${!feedback.is_read ? 'border-blue-200 bg-blue-50' : ''}`}
                    onClick={() => {
                      if (!feedback.is_read) {
                        markAsRead(feedback.id);
                      }
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{feedback.title}</CardTitle>
                        {!feedback.is_read && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center mb-3">
                        {renderStars(feedback.rating)}
                        <span className="ml-2 text-sm">{feedback.rating}/10</span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{feedback.message}</p>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>
                          From: {feedback.student_name}
                        </span>
                        <span>
                          {format(new Date(feedback.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
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

export default AdminFeedbackPage;
