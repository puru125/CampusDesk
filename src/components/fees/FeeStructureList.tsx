
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Search, Trash, Plus, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FeeStructure {
  id: string;
  fee_type: string;
  amount: number;
  academic_year: string;
  semester: number | null;
  is_active: boolean;
  course_id: string | null;
  course_name?: string;
  created_at: string;
  updated_at: string;
}

const FeeStructureList = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [feeTypeFilter, setFeeTypeFilter] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const academicYears = ["2023-2024", "2024-2025", "2025-2026"];
  const feeTypes = ["Tuition", "Examination", "Library", "Laboratory", "Miscellaneous"];

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('fee_structures')
        .select(`
          id,
          fee_type,
          amount,
          academic_year,
          semester,
          is_active,
          course_id,
          created_at,
          updated_at,
          courses:course_id (
            name
          )
        `);
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedData: FeeStructure[] = data.map(item => ({
          id: item.id,
          fee_type: item.fee_type,
          amount: item.amount,
          academic_year: item.academic_year,
          semester: item.semester,
          is_active: item.is_active,
          course_id: item.course_id,
          course_name: item.courses?.name,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        setFeeStructures(formattedData);
      }
    } catch (error) {
      console.error("Error fetching fee structures:", error);
      toast({
        title: "Error",
        description: "Failed to fetch fee structures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    // Fix: Navigate to the correct path with the fee structure id
    navigate(`/fees/structure/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fee_structures')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setFeeStructures(feeStructures.filter(fs => fs.id !== id));
      
      toast({
        title: "Success",
        description: "Fee structure deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting fee structure:", error);
      toast({
        title: "Error",
        description: "Failed to delete fee structure",
        variant: "destructive",
      });
    }
  };

  const filteredFeeStructures = feeStructures.filter(fs => {
    const matchesSearch = fs.fee_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (fs.course_name && fs.course_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesYear = academicYearFilter === "all" || !academicYearFilter ? true : fs.academic_year === academicYearFilter;
    const matchesFeeType = feeTypeFilter === "all" || !feeTypeFilter ? true : fs.fee_type === feeTypeFilter;
    
    return matchesSearch && matchesYear && matchesFeeType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search fee structures..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Academic Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {academicYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={feeTypeFilter} onValueChange={setFeeTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Fee Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {feeTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-institute-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow">
          {filteredFeeStructures.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No fee structures found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || academicYearFilter || feeTypeFilter ? 
                  "Try adjusting your search terms or filters" : 
                  "Add your first fee structure to get started"}
              </p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/fees/structure/new")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Fee Structure
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeeStructures.map((feeStructure) => (
                  <TableRow key={feeStructure.id}>
                    <TableCell className="font-medium">{feeStructure.fee_type}</TableCell>
                    <TableCell>₹{feeStructure.amount.toLocaleString()}</TableCell>
                    <TableCell>{feeStructure.academic_year}</TableCell>
                    <TableCell>{feeStructure.semester ? `Semester ${feeStructure.semester}` : "All"}</TableCell>
                    <TableCell>{feeStructure.course_name || "All Courses"}</TableCell>
                    <TableCell>
                      <Badge variant={feeStructure.is_active ? "default" : "secondary"}>
                        {feeStructure.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(feeStructure.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(feeStructure.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
};

export default FeeStructureList;
