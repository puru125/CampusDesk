
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/page-header";
import { StudentDoubtsCard, StudentDoubt } from "@/components/teacher/StudentDoubtsCard";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft } from "lucide-react";

const TeacherDoubtsPage = () => {
  const navigate = useNavigate();
  const [selectedDoubt, setSelectedDoubt] = useState<StudentDoubt | null>(null);
  
  // Mock data for demonstration - replace with actual data fetch
  const mockDoubts: StudentDoubt[] = [
    {
      id: "1",
      title: "Question about React Hooks",
      question: "I'm struggling to understand how useEffect dependencies work. Can you explain?",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      student_id: "student1",
      teacher_id: "teacher1",
      subject_id: "subject1",
      subjects: {
        name: "React Programming",
        code: "CSE101"
      },
      students: {
        user_id: "user1",
        users: {
          full_name: "John Doe"
        }
      }
    },
    {
      id: "2",
      title: "Trouble with Array Methods",
      question: "Can you explain the difference between map, filter, and reduce?",
      status: "answered",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      student_id: "student2",
      teacher_id: "teacher1",
      subject_id: "subject2",
      subjects: {
        name: "JavaScript Fundamentals",
        code: "CSE102"
      },
      students: {
        user_id: "user2",
        users: {
          full_name: "Jane Smith"
        }
      }
    }
  ];
  
  const handleViewDoubt = (doubt: StudentDoubt) => {
    setSelectedDoubt(doubt);
    // Navigate to detail page or open modal
    console.log("Viewing doubt:", doubt);
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
      
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockDoubts.map(doubt => (
          <StudentDoubtsCard 
            key={doubt.id} 
            doubt={doubt} 
            onViewClick={handleViewDoubt} 
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherDoubtsPage;
