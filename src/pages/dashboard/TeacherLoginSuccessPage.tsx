
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, School, CheckCircle, FileText, Bell, Calendar, BarChart } from "lucide-react";

const TeacherLoginSuccessPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center">Session Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">Your session has expired or you are not logged in.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Module features
  const features = [
    {
      title: "Personal Details",
      description: "Update your profile information and qualifications",
      icon: Users,
      path: "/teacher/profile"
    },
    {
      title: "Class Management",
      description: "View and manage your assigned courses and schedules",
      icon: School,
      path: "/teacher/classes"
    },
    {
      title: "Student Management",
      description: "Review student details and mark attendance",
      icon: Users,
      path: "/teacher/students"
    },
    {
      title: "Assignment & Exams",
      description: "Create, grade, and manage assessments",
      icon: FileText,
      path: "/teacher/assignments"
    },
    {
      title: "Communication",
      description: "Send announcements and chat with students",
      icon: Bell,
      path: "/teacher/communication"
    },
    {
      title: "Reports",
      description: "Track student performance and generate reports",
      icon: BarChart,
      path: "/teacher/reports"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="bg-green-50 border-b">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle>Login Successful</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Name:</span>
              <span>{user.full_name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Role:</span>
              <span className="capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">First Login:</span>
              <span>{user.is_first_login ? "Yes" : "No"}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button variant="outline" onClick={() => navigate("/")}>Go to Dashboard</Button>
          <Button variant="destructive" onClick={logout}>Logout</Button>
        </CardFooter>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Teacher Dashboard Preview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <School className="mr-2 h-5 w-5 text-institute-600" />
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">4</p>
            <p className="text-sm text-gray-500">Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-institute-600" />
              My Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">128</p>
            <p className="text-sm text-gray-500">Total enrolled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-institute-600" />
              Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm text-gray-500">Teaching</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold my-6">Available Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <feature.icon className="mr-2 h-5 w-5 text-institute-600" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate(feature.path)}
              >
                Access
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherLoginSuccessPage;
