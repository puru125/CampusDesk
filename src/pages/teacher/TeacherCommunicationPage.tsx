
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, Send, Search, Users, MessageSquare, ChevronDown, MenuSquare, 
  Edit, Trash2, Loader2, Calendar, FileText, Upload, BookOpen
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import StudyMaterialUpload from "@/components/teacher/StudyMaterialUpload";

const TeacherCommunicationPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    fetchTeacherData();
    fetchAnnouncements();
  }, [user]);
  
  const fetchTeacherData = async () => {
    try {
      if (!user) return;
      
      // Get teacher profile
      const { data: teacherProfile, error: teacherError } = await extendedSupabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();
          
      if (teacherError) throw teacherError;
      
      setTeacherId(teacherProfile.id);
      
      // Get teacher's classes from timetable
      const { data: timetableEntries, error: timetableError } = await extendedSupabase
        .from('timetable_entries')
        .select(`
          subjects(id, name, code),
          classes(id, name, room, capacity)
        `)
        .eq('teacher_id', teacherProfile.id);
          
      if (timetableError) throw timetableError;
      
      // Format classes data - filter out duplicates based on class ID
      const formattedClasses = timetableEntries?.filter(te => te.classes).map(te => ({
        id: te.classes?.id || 'unknown',
        name: te.classes?.name || 'Unknown Class',
        room: te.classes?.room || '',
        subject: te.subjects?.name || 'Unknown Subject',
        code: te.subjects?.code || ''
      })).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) || [];
      
      setClasses(formattedClasses);
      setLoading(false);
      
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch class data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  const fetchAnnouncements = async () => {
    try {
      if (!user) return;
      
      // Get teacher profile if not already set
      if (!teacherId) {
        const { data: teacherProfile, error: teacherError } = await extendedSupabase
          .from('teachers')
          .select('id')
          .eq('user_id', user.id)
          .single();
            
        if (teacherError) throw teacherError;
        
        setTeacherId(teacherProfile.id);
      }
      
      // Fetch announcements created by this teacher
      const { data: announcementsData, error: announcementsError } = await extendedSupabase
        .from('announcements')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
            
      if (announcementsError) throw announcementsError;
      
      setAnnouncements(announcementsData || []);
      
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      });
    }
  };
  
  const handleSubmitAnnouncement = async () => {
    try {
      setSendingAnnouncement(true);
      
      if (!announcementTitle.trim() || !announcementContent.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide both title and content for the announcement",
          variant: "destructive",
        });
        return;
      }
      
      // Determine target audience
      let targetRole = "student"; // Default to students
      
      // Insert announcement into database
      const { data: newAnnouncement, error: announcementError } = await extendedSupabase
        .from('announcements')
        .insert({
          title: announcementTitle,
          content: announcementContent,
          target_role: targetRole,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (announcementError) throw announcementError;
      
      // Add to local state
      setAnnouncements([newAnnouncement, ...announcements]);
      
      // Clear form
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setSelectedClass("");
      
      toast({
        title: "Announcement Sent",
        description: "Your announcement has been sent successfully",
      });
    } catch (error) {
      console.error("Error sending announcement:", error);
      toast({
        title: "Error",
        description: "Failed to send announcement",
        variant: "destructive",
      });
    } finally {
      setSendingAnnouncement(false);
    }
  };
  
  const handleDeleteAnnouncement = async (id: string) => {
    try {
      // Delete from database
      const { error } = await extendedSupabase
        .from('announcements')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove from local state
      setAnnouncements(announcements.filter(a => a.id !== id));
      
      toast({
        title: "Announcement Deleted",
        description: "Announcement has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };
  
  // Filter announcements by search term
  const filteredAnnouncements = announcements.filter(announcement => 
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <PageHeader
        title="Communication"
        description="Send announcements and share study materials with students"
        icon={Bell}
      />
      
      <Tabs defaultValue="announcements" className="mt-6">
        <TabsList>
          <TabsTrigger value="announcements" className="flex items-center">
            <MenuSquare className="mr-2 h-4 w-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="study-materials" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            Study Materials
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="announcements" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Announcement Title"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Announcement Content"
                  className="min-h-[100px]"
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Target Audience (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.subject} ({cls.room})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmitAnnouncement} 
                disabled={sendingAnnouncement}
                className="w-full"
              >
                {sendingAnnouncement ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Announcement
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Announcements</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search announcements..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
                </div>
              ) : filteredAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {filteredAnnouncements.map((announcement) => (
                    <Card key={announcement.id} className="border-l-4 border-l-institute-500">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{announcement.title}</CardTitle>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm">{announcement.content}</p>
                      </CardContent>
                      <CardFooter className="pt-0 pb-2 flex justify-between items-center">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{format(new Date(announcement.created_at), "PPP 'at' h:mm a")}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          <span>Target: {announcement.target_role === 'student' ? 'Students' : 'All'}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No Announcements</h3>
                  <p className="mt-1 text-gray-500">
                    You haven't created any announcements yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="study-materials" className="mt-6">
          <StudyMaterialUpload teacherId={teacherId} classes={classes} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherCommunicationPage;
