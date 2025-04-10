
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SeedDataButton from "@/components/admin/SeedDataButton";

const StudentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: students, isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_all_students");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student records and information"
        icon={Users}
      >
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button onClick={() => navigate("/students/new")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          )}
          {isAdmin && <SeedDataButton />}
        </div>
      </PageHeader>

      <Card className="mt-6">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Error loading students: {error.message}
            </div>
          ) : students?.length === 0 ? (
            <div className="text-center text-gray-500">
              No students found. Use the "Add Student" button to create new student records.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Enrollment No</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Joined On</th>
                  </tr>
                </thead>
                <tbody>
                  {students?.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <td className="p-2 border">{student.full_name}</td>
                      <td className="p-2 border">{student.email}</td>
                      <td className="p-2 border">{student.enrollment_number}</td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            student.enrollment_status === "approved"
                              ? "bg-green-100 text-green-800"
                              : student.enrollment_status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.enrollment_status}
                        </span>
                      </td>
                      <td className="p-2 border">
                        {student.enrollment_date
                          ? new Date(student.enrollment_date).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsPage;
