
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Search,
  Loader2,
  BookOpen,
  Download,
  Calendar,
  User,
  FileIcon,
  FileQuestion
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const StudentStudyMaterialsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    fetchStudentMaterials();
  }, [user]);
  
  const fetchStudentMaterials = async () => {
    try {
      if (!user) return;
      
      // Get student profile
      const { data: studentProfile, error: studentError } = await extendedSupabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();
          
      if (studentError) throw studentError;
      
      // Get enrolled courses
      const { data: enrollments, error: enrollmentError } = await extendedSupabase
        .from('student_course_enrollments')
        .select('course_id')
        .eq('student_id', studentProfile.id)
        .eq('status', 'approved');
          
      if (enrollmentError) throw enrollmentError;
      
      if (!enrollments || enrollments.length === 0) {
        setLoading(false);
        return;
      }
      
      const courseIds = enrollments.map(e => e.course_id);
      
      // Get subjects for these courses
      const { data: subjectsData, error: subjectsError } = await extendedSupabase
        .from('subjects')
        .select('id, name, code')
        .in('course_id', courseIds);
          
      if (subjectsError) throw subjectsError;
      
      setSubjects(subjectsData || []);
      
      // Get study materials for these subjects
      if (subjectsData && subjectsData.length > 0) {
        const subjectIds = subjectsData.map(s => s.id);
        
        const { data: materialsData, error: materialsError } = await extendedSupabase
          .from('study_materials')
          .select(`
            *,
            subjects(id, name, code),
            teachers:teacher_id(id, users:user_id(full_name))
          `)
          .in('subject_id', subjectIds)
          .order('created_at', { ascending: false });
            
        if (materialsError) throw materialsError;
        
        setMaterials(materialsData || []);
      }
      
    } catch (error) {
      console.error("Error fetching study materials:", error);
      toast({
        title: "Error",
        description: "Failed to fetch study materials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter materials based on search term and selected subject
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subjects?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.teachers?.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === "all" || material.subject_id === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType.includes('image')) return <FileIcon className="h-8 w-8 text-green-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-8 w-8 text-blue-500" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileText className="h-8 w-8 text-green-600" />;
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return <FileText className="h-8 w-8 text-orange-500" />;
    return <FileQuestion className="h-8 w-8 text-gray-500" />;
  };
  
  return (
    <div>
      <PageHeader
        title="Study Materials"
        description="Access course materials shared by your teachers"
        icon={BookOpen}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search materials..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Available Study Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
            </div>
          ) : filteredMaterials.length > 0 ? (
            <div className="space-y-4">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="overflow-hidden">
                  <div className="flex border-b p-4">
                    <div className="flex-shrink-0 pr-4">
                      {getFileIcon(material.file_type)}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{material.title}</h3>
                      {material.description && (
                        <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                      )}
                      <div className="flex flex-wrap items-center mt-2 text-xs text-gray-500 gap-3">
                        <div className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          <span>{material.subjects?.name}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          <span>{material.teachers?.users?.full_name || 'Unknown Teacher'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{format(new Date(material.created_at), "PPP")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                      <a 
                        href={material.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Study Materials</h3>
              <p className="mt-1 text-gray-500">
                No study materials are available for your courses yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentStudyMaterialsPage;
