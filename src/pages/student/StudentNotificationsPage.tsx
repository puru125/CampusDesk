
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const StudentNotificationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user) return;

        // Get student ID first
        const { data: studentData, error: studentError } = await extendedSupabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (studentError) throw studentError;

        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await extendedSupabase
          .from('student_notifications')
          .select('*')
          .eq('student_id', studentData.id)
          .order('created_at', { ascending: false });

        if (notificationsError) throw notificationsError;

        setNotifications(notificationsData || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      setMarkingAsRead(notificationId);
      
      // Update notification status
      const { error } = await extendedSupabase
        .from('student_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true } 
          : notification
      ));
      
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      });
    } finally {
      setMarkingAsRead(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user) return;

      // Get student ID first
      const { data: studentData, error: studentError } = await extendedSupabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError) throw studentError;
      
      // Update all unread notifications
      const { error } = await extendedSupabase
        .from('student_notifications')
        .update({ is_read: true })
        .eq('student_id', studentData.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive",
      });
    }
  };

  const getFormattedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy • h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay updated with important announcements and alerts"
        icon={Bell}
      >
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </PageHeader>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4 mt-6">
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`border ${!notification.is_read ? 'border-institute-200 bg-institute-50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">{notification.title}</h3>
                    <p className="text-sm text-gray-500">
                      {getFormattedDate(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAsRead(notification.id)}
                      disabled={markingAsRead === notification.id}
                    >
                      {markingAsRead === notification.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Mark as read"
                      )}
                    </Button>
                  )}
                </div>
                <div className="mt-2">{notification.message}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Notifications</AlertTitle>
          <AlertDescription>
            You don't have any notifications at the moment.
          </AlertDescription>
        </Alert>
      )}
      
      {!loading && unreadCount > 0 && (
        <div className="fixed bottom-6 right-6">
          <Button className="rounded-full px-4 py-2 shadow-lg" onClick={markAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark All as Read ({unreadCount})
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentNotificationsPage;
