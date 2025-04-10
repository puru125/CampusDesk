import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Announcement } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger, 
  DialogClose 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/ui/page-header";
import { format } from "date-fns";
import { Megaphone, PlusCircle, Pencil, Trash } from "lucide-react";

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAnnouncements();
  }, [user]);
  
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("announcements_view")
        .select("*");
        
      if (user?.role !== 'admin') {
        query = query.or(`target_role.eq.all,target_role.eq.${user?.role}`);
      }
      
      query = query.order("created_at", { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setAnnouncements(data as unknown as Announcement[]);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const announcementData = {
        title,
        content,
        target_role: targetRole,
        created_by: user?.id,
        is_active: true
      };
      
      const { error } = await supabase
        .from("announcements")
        .insert(announcementData);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      
      setTitle("");
      setContent("");
      setTargetRole("all");
      
      fetchAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdate = async () => {
    if (!editingId || !title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("announcements")
        .update({
          title,
          content,
          target_role: targetRole,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
      
      setTitle("");
      setContent("");
      setTargetRole("all");
      setEditingId(null);
      
      fetchAnnouncements();
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };
  
  const handleEdit = (announcement: Announcement) => {
    setTitle(announcement.title);
    setContent(announcement.content);
    setTargetRole(announcement.target_role);
    setEditingId(announcement.id);
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="View announcements from the institute administration"
      />
      
      {user?.role === 'admin' && (
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Announcement" : "Create New Announcement"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="target">Target Audience</Label>
                  <Select
                    value={targetRole}
                    onValueChange={(value) => setTargetRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="student">Students Only</SelectItem>
                      <SelectItem value="teacher">Teachers Only</SelectItem>
                      <SelectItem value="admin">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Announcement content"
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={editingId ? handleUpdate : handleSubmit}>
                    {editingId ? "Update" : "Create"}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-8 w-8 border-4 border-institute-500 border-t-transparent rounded-full"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No announcements found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="border-l-4 border-l-institute-500 mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {format(new Date(announcement.created_at), "MMMM d, yyyy")}
                        </p>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(announcement)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(announcement.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{announcement.content}</p>
                    <div className="flex justify-between mt-4 text-sm text-gray-500">
                      {announcement.created_by_name && (
                        <span>Posted by: {announcement.created_by_name}</span>
                      )}
                      <span>
                        For: {announcement.target_role === "all" ? "Everyone" : 
                            announcement.target_role === "student" ? "Students" :
                            announcement.target_role === "teacher" ? "Teachers" : "Admins"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementsPage;
