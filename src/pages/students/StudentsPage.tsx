
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StudentView } from "@/types";
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
import { UserPlus, Search, Calendar, Mail, Phone, Home, Info, Filter } from "lucide-react";
import { format } from "date-fns";
import YearSessionFilter from "@/components/filters/YearSessionFilter";
import { YearSessionValues } from "@/lib/validation-rules";

const StudentsPage = () => {
  const [students, setStudents] = useState<StudentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<YearSessionValues>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, [yearFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Use the students table with a join to users
      let query = supabase
        .from('students')
        .select(`
          id,
          user_id,
          enrollment_number,
          date_of_birth,
          enrollment_date,
          enrollment_status,
          contact_number,
          address,
          guardian_name,
          guardian_contact,
          fee_status,
          total_fees_due,
          total_fees_paid,
          last_payment_date,
          created_at,
          updated_at,
          users:user_id (
            email,
            full_name
          )
        `);
      
      // Apply year filter if provided
      if (yearFilter.year) {
        const startDate = yearFilter.session && yearFilter.session.includes('1') 
          ? `${yearFilter.year}-01-01` 
          : yearFilter.session && yearFilter.session.includes('2')
            ? `${yearFilter.year}-07-01`
            : `${yearFilter.year}-01-01`;
        
        const endDate = yearFilter.session && yearFilter.session.includes('1')
          ? `${yearFilter.year}-06-30`
          : yearFilter.session && yearFilter.session.includes('2')
            ? `${yearFilter.year}-12-31`
            : `${yearFilter.year}-12-31`;
        
        query = query.gte('enrollment_date', startDate)
                     .lte('enrollment_date', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const studentsWithUserInfo: StudentView[] = data.map(student => ({
          id: student.id,
          user_id: student.user_id,
          enrollment_number: student.enrollment_number,
          date_of_birth: student.date_of_birth,
          enrollment_date: student.enrollment_date,
          enrollment_status: student.enrollment_status as any,
          contact_number: student.contact_number,
          address: student.address,
          guardian_name: student.guardian_name,
          guardian_contact: student.guardian_contact,
          fee_status: student.fee_status as any,
          total_fees_due: student.total_fees_due,
          total_fees_paid: student.total_fees_paid,
          last_payment_date: student.last_payment_date,
          created_at: student.created_at,
          updated_at: student.updated_at,
          email: student.users?.email,
          full_name: student.users?.full_name
        }));
        
        setStudents(studentsWithUserInfo);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
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

  const filteredStudents = students.filter((student) => {
    const searchFields = [
      student.full_name,
      student.email,
      student.enrollment_number,
      student.enrollment_status,
    ];
    
    return searchFields.some(field => 
      field && field.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "graduated":
        return "bg-blue-100 text-blue-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "on_leave":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFeeStatusBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "partial":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleFilterChange = (filter: YearSessionValues) => {
    setYearFilter(filter);
  };

  return (
    <>
      <PageHeader
        title="Students"
        description="Manage student records and enrollments"
      >
        <Button onClick={() => navigate("/students/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </PageHeader>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search students..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <YearSessionFilter 
              onFilterChange={handleFilterChange}
              sessions={["Semester 1", "Semester 2"]}
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
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center">
              <Info className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No students found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || Object.keys(yearFilter).length > 0 ? 
                  "Try adjusting your search terms or filters" : 
                  "Add your first student to get started"}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={() => navigate("/students/new")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Enrollment Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollment Date</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Fees Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow 
                    key={student.id}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="font-medium">{student.full_name}</div>
                      <div className="text-gray-500 text-sm">{student.email}</div>
                    </TableCell>
                    <TableCell>{student.enrollment_number}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(student.enrollment_status || 'pending')}`}>
                        {student.enrollment_status?.replace('_', ' ') || 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(student.enrollment_date)}</TableCell>
                    <TableCell>{formatDate(student.date_of_birth)}</TableCell>
                    <TableCell>
                      {student.contact_number ? (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" /> {student.contact_number}
                        </div>
                      ) : "Not provided"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getFeeStatusBadgeClass(student.fee_status || 'pending')}`}>
                        {student.fee_status?.replace('_', ' ') || 'Pending'}
                      </span>
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

export default StudentsPage;
