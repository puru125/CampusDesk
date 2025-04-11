
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  File,
  Trash2,
  Download,
  BookOpen,
  Loader2,
  Calendar,
  FileIcon,
  FileQuestion
} from "lucide-react";
import { format } from "date-fns";

interface StudyMaterialUploadProps {
  teacherId: string | null;
  classes: any[];
}

const StudyMaterialUpload = ({ teacherId, classes }: StudyMaterialUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    if (teacherId) {
      fetchSubjects();
      fetchMaterials();
    }
  }, [teacherId]);
  
  const fetchSubjects = async () => {
    try {
      if (!teacherId) return;
      
      const { data, error } = await supabase
        .from("teacher_subjects")
        .select(`
          subject_id,
          subjects(id, name, code)
        `)
        .eq("teacher_id", teacherId);
      
      if (error) throw error;
      
      const formattedSubjects = data
        ?.filter(item => item.subjects)
        .map(item => ({
          id: item.subjects.id,
          name: item.subjects.name,
          code: item.subjects.code
        })) || [];
      
      setSubjects(formattedSubjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    }
  };
  
  const fetchMaterials = async () => {
    try {
      if (!teacherId) return;
      
      const { data, error } = await supabase
        .from("study_materials")
        .select(`
          *,
          subjects(id, name, code)
        `)
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setMaterials(data || []);
    } catch (error) {
      console.error("Error fetching study materials:", error);
      toast({
        title: "Error",
        description: "Failed to fetch study materials",
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };
  
  const handleUpload = async () => {
    try {
      if (!teacherId || !title.trim() || !subjectId || !file) {
        toast({
          title: "Missing Information",
          description: "Please provide title, subject, and a file",
          variant: "destructive",
        });
        return;
      }
      
      setUploadLoading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `study-materials/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('study-materials')
        .getPublicUrl(filePath);
      
      // Insert record in the database
      const { data: materialData, error: insertError } = await supabase
        .from("study_materials")
        .insert({
          title,
          description: description || null,
          subject_id: subjectId,
          teacher_id: teacherId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          file_url: urlData.publicUrl
        })
        .select();
      
      if (insertError) throw insertError;
      
      // Update local state
      if (materialData && materialData.length > 0) {
        setMaterials([materialData[0], ...materials]);
      }
      
      // Reset form
      setTitle("");
      setDescription("");
      setSubjectId("");
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('material-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast({
        title: "Upload Successful",
        description: "Study material has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading study material:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload study material",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };
  
  const handleDelete = async (id: string, filePath: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from("study_materials")
        .delete()
        .eq("id", id);
      
      if (dbError) throw dbError;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('study-materials')
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Update local state
      setMaterials(materials.filter(m => m.id !== id));
      
      toast({
        title: "Deleted",
        description: "Study material has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting study material:", error);
      toast({
        title: "Error",
        description: "Failed to delete study material",
        variant: "destructive",
      });
    }
  };
  
  // Filter materials by search term
  const filteredMaterials = materials.filter(material => 
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.subjects?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType.includes('image')) return <FileIcon className="h-8 w-8 text-green-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-8 w-8 text-blue-500" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileText className="h-8 w-8 text-green-600" />;
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return <FileText className="h-8 w-8 text-orange-500" />;
    return <FileQuestion className="h-8 w-8 text-gray-500" />;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Study Material</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Material Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Textarea
              placeholder="Description (optional)"
              className="min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Input
              id="material-file"
              type="file"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              Upload PDF, Word, Excel, PowerPoint, or image files (max 10MB)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleUpload} 
            disabled={uploadLoading || !file || !title || !subjectId}
            className="w-full"
          >
            {uploadLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Material
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">My Study Materials</CardTitle>
          <div className="relative w-64">
            <Input
              placeholder="Search materials..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          </div>
        </CardHeader>
        <CardContent>
          {fetchLoading ? (
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
                    <div className="flex-grow pr-4">
                      <h3 className="font-medium">{material.title}</h3>
                      {material.description && (
                        <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                      )}
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <BookOpen className="h-3 w-3 mr-1" />
                        <span className="mr-3">{material.subjects?.name}</span>
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(new Date(material.created_at), "PPP")}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex">
                      <a 
                        href={material.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mr-2"
                      >
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </a>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500"
                        onClick={() => handleDelete(material.id, material.file_path)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                You haven't uploaded any study materials yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyMaterialUpload;
