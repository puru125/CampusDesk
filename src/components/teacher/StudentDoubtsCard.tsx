
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, HelpCircle, MoreHorizontal } from "lucide-react";
import { extendedSupabase } from '@/integrations/supabase/extendedClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface StudentDoubt {
  id: string;
  title: string;
  question: string;
  status: string;
  created_at: string;
  student_id: string;
  student_name?: string;
  subject_name?: string;
}

export function StudentDoubtsCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [doubts, setDoubts] = useState<StudentDoubt[]>([]);

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        if (!user) return;

        // Get teacher profile first
        const { data: teacherProfile, error: teacherError } = await extendedSupabase
          .from('teachers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (teacherError) throw teacherError;
        
        // Get recent doubts assigned to this teacher
        const { data, error } = await extendedSupabase
          .from('student_doubts')
          .select(`
            id,
            title,
            question,
            status,
            created_at,
            student_id,
            subject_id,
            subjects:subject_id(name)
          `)
          .eq('teacher_id', teacherProfile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (data) {
          // Get student names for each doubt
          const studentIds = [...new Set(data.map(doubt => doubt.student_id))];
          
          const { data: students, error: studentsError } = await extendedSupabase
            .from('students_view')
            .select('id, full_name')
            .in('id', studentIds);
          
          if (studentsError) throw studentsError;
          
          // Map student names to doubts
          const studentMap = new Map();
          students?.forEach(student => {
            studentMap.set(student.id, student.full_name);
          });
          
          // Format doubts with student names
          const formattedDoubts = data.map(doubt => ({
            id: doubt.id,
            title: doubt.title,
            question: doubt.question,
            status: doubt.status,
            created_at: doubt.created_at,
            student_id: doubt.student_id,
            student_name: studentMap.get(doubt.student_id) || 'Unknown Student',
            subject_name: doubt.subjects?.name || 'General'
          }));
          
          setDoubts(formattedDoubts);
        }
      } catch (error) {
        console.error('Error fetching student doubts:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch student doubts',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoubts();
  }, [user, toast]);

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'answered':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Recent Student Doubts
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/teacher/doubts">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : doubts.length > 0 ? (
          <div className="space-y-4">
            {doubts.map((doubt) => (
              <div key={doubt.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{doubt.title}</h3>
                    <p className="text-sm text-gray-500">
                      By: {doubt.student_name} • {doubt.subject_name} • {formatDate(doubt.created_at)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(doubt.status)}`}>
                    {doubt.status}
                  </span>
                </div>
                <p className="text-sm mb-2 line-clamp-2">{doubt.question}</p>
                <Button variant="ghost" size="sm" asChild className="mt-2">
                  <Link to={`/teacher/doubts/${doubt.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-md font-medium">No Doubts</h3>
            <p className="text-sm text-gray-500 mt-1">
              You don't have any student doubts to respond to.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
