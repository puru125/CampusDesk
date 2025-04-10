
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Calendar, CheckCircle } from "lucide-react";

const StudentLoginSuccessPage = () => {
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

      <h2 className="text-2xl font-bold mb-4">Student Dashboard Preview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <GraduationCap className="mr-2 h-5 w-5 text-institute-600" />
              My Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm text-gray-500">Currently enrolled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-institute-600" />
              Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">7/8</p>
            <p className="text-sm text-gray-500">Completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-institute-600" />
              Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2</p>
            <p className="text-sm text-gray-500">Today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentLoginSuccessPage;
