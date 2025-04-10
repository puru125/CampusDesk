
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Circle } from "lucide-react";

export interface StudentDoubt {
  id: string;
  title: string;
  question: string;
  status: "pending" | "answered" | "closed";
  created_at: string;
  updated_at: string;
  student_id: string;
  teacher_id: string;
  subject_id: string | null;
  subjects?: {
    name: string;
    code: string;
  } | null;
  students?: {
    user_id: string;
    users?: {
      full_name: string;
    }
  }
}

interface StudentDoubtsCardProps {
  doubt: StudentDoubt;
  onViewClick: (doubt: StudentDoubt) => void;
}

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

export const StudentDoubtsCard: React.FC<StudentDoubtsCardProps> = ({ doubt, onViewClick }) => {
  const formattedTime = formatDistanceToNow(new Date(doubt.created_at), {
    addSuffix: true,
  });
  
  const studentName = doubt.students?.users?.full_name || "Unknown Student";
  const subjectName = doubt.subjects?.name || "General";

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow" 
      onClick={() => onViewClick(doubt)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-1">{doubt.title}</h3>
          <Badge variant="outline" className="ml-2 shrink-0">
            <Circle className={`h-2 w-2 mr-1 ${getStatusColor(doubt.status)}`} />
            {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{doubt.question}</p>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{studentName}</span>
          <span>{formattedTime}</span>
        </div>
        
        <div className="text-xs text-gray-400 mt-1 italic">
          Subject: {subjectName}
        </div>
      </CardContent>
    </Card>
  );
};

// Also export as default for backward compatibility
export default StudentDoubtsCard;
