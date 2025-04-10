
import { useState, useEffect } from "react";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  student_id: string;
}

interface StudentNotificationsListProps {
  limit?: number;
  showViewAll?: boolean;
}

const StudentNotificationsList = ({ limit, showViewAll = true }: StudentNotificationsListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchStudentId();
    }
  }, [user]);

  useEffect(() => {
    if (studentId) {
      fetchNotifications();
    }
  }, [studentId, limit]);

  const fetchStudentId = async () => {
    try {
      const { data, error } = await extendedSupabase
        .from('students')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setStudentId(data.id);
      }
    } catch (error) {
      console.error("Error fetching student ID:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      let query = extendedSupabase
        .from('student_notifications')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
        
      if (limit) {
        query = query.limit(limit);
      }
        
      const { data, error } = await query;

      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Could not fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await extendedSupabase
        .from('student_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const viewAllNotifications = () => {
    navigate("/student/notifications");
  };

  const handleNotificationAction = (notification: Notification) => {
    // Handle notification actions based on title or content
    if (notification.title.toLowerCase().includes("enrollment approved") || 
        notification.message.toLowerCase().includes("fee payment")) {
      navigate("/fees/payment/new");
    } else {
      // Just mark as read for other notifications
      markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    const title = notification.title.toLowerCase();
    
    if (title.includes("approved") || title.includes("success")) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (title.includes("rejected") || title.includes("failed") || title.includes("error")) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    } else if (title.includes("payment") || title.includes("fee")) {
      return <CreditCard className="h-5 w-5 text-blue-500" />;
    } else {
      return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit || 3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 h-24"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`transition-colors ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getNotificationIcon(notification)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <Badge variant="secondary" className="text-xs bg-blue-100">New</Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    variant={notification.is_read ? "ghost" : "secondary"}
                    className="text-xs"
                    onClick={() => handleNotificationAction(notification)}
                  >
                    {notification.title.toLowerCase().includes("enrollment approved") ? 
                      "Pay Fees" : "Mark as Read"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {showViewAll && notifications.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={viewAllNotifications}>
            View All Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentNotificationsList;
