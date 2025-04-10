import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, MessageCircle, Clock, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface StudentDoubt {
  id: string;
  title: string;
  question: string;
  status: string;
  created_at: string;
  student: {
    user_id: string;
    users: {
      full_name: string;
    }
  };
  subjects: {
    name: string;
  } | null;
  doubt_answers: {
    id: string;
    answer: string;
    created_at: string;
  }[] | null;
}

const StudentDoubtsCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [doubts, setDoubts] = useState<StudentDoubt[]>([]);
  const [selectedDoubt, setSelectedDoubt] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchStudentDoubts = async () => {
      try {
        if (!user) return;
        
        // Get teacher profile
        const { data: teacherProfile, error: teacherError } = await extendedSupabase
          .from('teachers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (teacherError) throw teacherError;
        
        // Get student doubts
        const { data, error } = await extendedSupabase
          .from('student_doubts')
          .select(`
            id,
            title,
            question,
            status,
            created_at,
            student:student_id(
              user_id,
              users:user_id(
                full_name
              )
            ),
            subjects:subject_id(
              name
            ),
            doubt_answers(
              id,
              answer,
              created_at
            )
          `)
          .eq('teacher_id', teacherProfile.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setDoubts(data || []);
      } catch (error) {
        console.error("Error fetching student doubts:", error);
        toast({
          title: "Error",
          description: "Failed to fetch student doubts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentDoubts();
  }, [user, toast]);
  
  const handleSubmitAnswer = async () => {
    if (!selectedDoubt || !answer.trim()) return;
    
    try {
      setSubmitting(true);
      
      // Get teacher profile
      const { data: teacherProfile, error: teacherError } = await extendedSupabase
        .from('teachers')
        .select('id')
        .eq('user_id', user?.id)
        .single();
        
      if (teacherError) throw teacherError;
      
      // Submit answer
      const { error } = await extendedSupabase
        .from('doubt_answers')
        .insert({
          doubt_id: selectedDoubt,
          teacher_id: teacherProfile.id,
          answer: answer.trim()
        });
        
      if (error) throw error;
      
      // Update doubt status
      await extendedSupabase
        .from('student_doubts')
        .update({ status: 'answered' })
        .eq('id', selectedDoubt);
      
      // Update local state
      setDoubts(prev => prev.map(doubt => {
        if (doubt.id === selectedDoubt) {
          return {
            ...doubt,
            status: 'answered',
            doubt_answers: [
              ...(doubt.doubt_answers || []),
              {
                id: 'temp-id', // This will be replaced on reload
                answer: answer.trim(),
                created_at: new Date().toISOString()
              }
            ]
          };
        }
        return doubt;
      }));
      
      // Reset form
      setAnswer("");
      
      toast({
        title: "Answer Submitted",
        description: "Your answer has been submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" />Pending
        </span>;
      case 'answered':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" />Answered
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <HelpCircle className="mr-2 h-5 w-5 text-institute-600" />
          Student Doubts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
          </div>
        ) : doubts.length > 0 ? (
          <div className="space-y-4">
            {doubts.map(doubt => (
              <div key={doubt.id} className="border rounded-md overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{doubt.title}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        From {doubt.student?.users?.full_name || 'Unknown Student'} • {format(new Date(doubt.created_at), 'PPp')}
                      </div>
                      {doubt.subjects && (
                        <div className="text-sm text-gray-500">
                          Subject: {doubt.subjects.name}
                        </div>
                      )}
                    </div>
                    <div>
                      {getStatusBadge(doubt.status)}
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-gray-50 p-3 rounded">
                    <p className="text-sm">{doubt.question}</p>
                  </div>
                  
                  {doubt.doubt_answers && doubt.doubt_answers.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-sm font-medium">Your Answers:</h4>
                      {doubt.doubt_answers.map(da => (
                        <div key={da.id} className="bg-blue-50 p-3 rounded">
                          <p className="text-sm">{da.answer}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            Answered on {format(new Date(da.created_at), 'PPp')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {doubt.status === 'pending' && selectedDoubt !== doubt.id && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSelectedDoubt(doubt.id)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Answer this doubt
                    </Button>
                  )}
                  
                  {selectedDoubt === doubt.id && (
                    <div className="mt-4 space-y-3">
                      <Textarea
                        placeholder="Write your answer here..."
                        className="min-h-[100px]"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedDoubt(null);
                            setAnswer("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmitAnswer}
                          disabled={!answer.trim() || submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Submit Answer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <HelpCircle className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No Doubts Yet</h3>
            <p className="mt-1 text-gray-500">
              Your students haven't submitted any questions yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentDoubtsCard;
