
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Teacher } from "@/types";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Search, Calendar, Mail, Phone, BookOpen, Info } from "lucide-react";
import { format } from "date-fns";

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      // Use the teachers_view we created
      const { data, error } = await supabase
        .from('teachers_view')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setTeachers(data as Teacher[] || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PP");
    } catch (error) {
      return "Invalid date";
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const searchFields = [
      teacher.full_name,
      teacher.email,
      teacher.employee_id,
      teacher.department,
      teacher.specialization,
      teacher.qualification,
    ];
    
    return searchFields.some(field => 
      field && field.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <PageHeader
        title="Teachers"
        description="Manage teacher records and assignments"
      >
        <Button onClick={() => navigate("/teachers/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </PageHeader>

      <div className="mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search teachers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-institute-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow">
          {filteredTeachers.length === 0 ? (
            <div className="py-12 text-center">
              <Info className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No teachers found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm ? "Try adjusting your search terms" : "Add your first teacher to get started"}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={() => navigate("/teachers/new")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Teacher
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow 
                    key={teacher.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/teachers/${teacher.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">{teacher.full_name}</div>
                      <div className="text-gray-500 text-sm">{teacher.email}</div>
                    </TableCell>
                    <TableCell>{teacher.employee_id}</TableCell>
                    <TableCell>{teacher.department || "Not assigned"}</TableCell>
                    <TableCell>{teacher.specialization || "Not specified"}</TableCell>
                    <TableCell>{teacher.qualification || "Not specified"}</TableCell>
                    <TableCell>{formatDate(teacher.joining_date)}</TableCell>
                    <TableCell>
                      {teacher.contact_number ? (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" /> {teacher.contact_number}
                        </div>
                      ) : "Not provided"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </>
  );
};

export default TeachersPage;
