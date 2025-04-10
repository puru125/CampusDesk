
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/page-header";
import StudentDoubtsCard from "@/components/teacher/StudentDoubtsCard";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft } from "lucide-react";

const TeacherDoubtsPage = () => {
  const navigate = useNavigate();
  
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
        <StudentDoubtsCard />
      </div>
    </div>
  );
};

export default TeacherDoubtsPage;
