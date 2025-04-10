
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, Send, Search, Users, MessageSquare, ChevronDown, MenuSquare, 
  Edit, Trash2, Loader2, Calendar
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
  
  useEffect(() => {
    // Mock data for now - this would be fetched from Supabase in a real implementation
    const mockAnnouncements = [
      {
        id: "1",
        title: "Midterm Exam Schedule",
        content: "The midterm exams will be held from October 15th to October 22nd. Please check the timetable for your specific exam dates and times.",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        target: "All Students",
      },
      {
        id: "2",
        title: "Assignment Deadline Extended",
        content: "The deadline for the Database Systems assignment has been extended by one week. The new submission date is November 5th.",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        target: "Database Systems",
      },
      {
        id: "3",
        title: "Guest Lecture Announcement",
        content: "There will be a guest lecture on 'Modern Web Development Practices' by Mr. John Smith on October 28th in the Main Auditorium at 2:00 PM.",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        target: "Web Development",
      },
    ];
    
    const mockClasses = [
      { id: "1", name: "Database Systems", courseCode: "CS301" },
      { id: "2", name: "Web Development", courseCode: "CS302" },
      { id: "3", name: "Data Structures", courseCode: "CS201" },
    ];
    
    setAnnouncements(mockAnnouncements);
    setClasses(mockClasses);
    setLoading(false);
  }, []);
  
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
      
      // In a real implementation, this would save to Supabase
      const newAnnouncement = {
        id: Date.now().toString(),
        title: announcementTitle,
        content: announcementContent,
        created_at: new Date(),
        target: selectedClass ? classes.find(c => c.id === selectedClass)?.name || "All Students" : "All Students",
      };
      
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
  
  return (
    <div>
      <PageHeader
        title="Communication"
        description="Send announcements and messages to students"
        icon={Bell}
      />
      
      <Tabs defaultValue="announcements" className="mt-6">
        <TabsList>
          <TabsTrigger value="announcements" className="flex items-center">
            <MenuSquare className="mr-2 h-4 w-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
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
                    <SelectValue placeholder="Target Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.courseCode})
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
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
                </div>
              ) : announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <Card key={announcement.id} className="border-l-4 border-l-institute-500">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{announcement.title}</CardTitle>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
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
                          <span>Target: {announcement.target}</span>
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
        
        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Direct Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Messaging Coming Soon</h3>
                <p className="mt-1 text-gray-500">
                  Direct messaging functionality will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherCommunicationPage;
