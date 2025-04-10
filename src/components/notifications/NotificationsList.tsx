
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertCircle, CreditCard, Info, Book } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string;
  student_id?: string;
  teacher_id?: string;
  category?: string;
}

interface NotificationsListProps {
  limit?: number;
  showViewAll?: boolean;
}

const NotificationsList = ({ limit, showViewAll = true }: NotificationsListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityId, setEntityId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserEntityId();
    }
  }, [user]);

  useEffect(() => {
    if (entityId || user?.role === 'admin') {
      fetchNotifications();
      
      // Set up real-time listener
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: getUserNotificationsTable()
          },
          (payload) => {
            console.log('Realtime notification update:', payload);
            fetchNotifications();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [entityId, user?.role]);

  const getUserNotificationsTable = () => {
    switch (user?.role) {
      case 'student': return 'student_notifications';
      case 'teacher': return 'teacher_notifications';
      case 'admin': return 'admin_notifications';
      default: return 'student_notifications';
    }
  };

  const fetchUserEntityId = async () => {
    try {
      if (!user) return;
      
      if (user.role === 'admin') {
        // Admin doesn't need an entity ID
        setEntityId(user.id);
        return;
      }
      
      const table = user.role === 'student' ? 'students' : 'teachers';
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setEntityId(data.id);
      }
    } catch (error) {
      console.error(`Error fetching ${user?.role} ID:`, error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      let query;
      
      if (user?.role === 'admin') {
        query = supabase
          .from('admin_notifications')
          .select('*')
          .order('created_at', { ascending: false });
      } else if (user?.role === 'teacher' && entityId) {
        query = supabase
          .from('teacher_notifications')
          .select('*')
          .eq('teacher_id', entityId)
          .order('created_at', { ascending: false });
      } else if (user?.role === 'student' && entityId) {
        query = supabase
          .from('student_notifications')
          .select('*')
          .eq('student_id', entityId)
          .order('created_at', { ascending: false });
      } else {
        setLoading(false);
        return;
      }
        
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
      const table = getUserNotificationsTable();
      
      const { error } = await supabase
        .from(table)
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
    switch (user?.role) {
      case 'admin':
        navigate("/admin/notifications");
        break;
      case 'teacher':
        navigate("/teacher/notifications");
        break;
      case 'student':
        navigate("/student/notifications");
        break;
      default:
        navigate("/notifications");
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    const title = notification.title.toLowerCase();
    
    // Handle student-specific actions
    if (user?.role === 'student') {
      if (title.includes("enrollment approved") || title.includes("fee payment")) {
        navigate("/fees/payment/new");
      } else if (title.includes("assignment")) {
        navigate("/student/assignments");
      } else {
        markAsRead(notification.id);
      }
    } 
    // Handle teacher-specific actions
    else if (user?.role === 'teacher') {
      if (title.includes("doubt") || title.includes("question")) {
        navigate("/teacher/doubts");
      } else if (title.includes("assignment")) {
        navigate("/teacher/assignments");
      } else {
        markAsRead(notification.id);
      }
    }
    // Handle admin-specific actions
    else if (user?.role === 'admin') {
      if (title.includes("enrollment")) {
        navigate("/settings/enrollment-approval");
      } else if (title.includes("payment")) {
        navigate("/fees");
      } else {
        markAsRead(notification.id);
      }
    } else {
      // Default action
      markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    const title = notification.title.toLowerCase();
    const category = notification.category?.toLowerCase() || '';
    
    if (title.includes("approved") || title.includes("success")) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (title.includes("rejected") || title.includes("failed") || title.includes("error")) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    } else if (title.includes("payment") || title.includes("fee") || category === 'payment') {
      return <CreditCard className="h-5 w-5 text-blue-500" />;
    } else if (title.includes("assignment") || title.includes("course") || category === 'academic') {
      return <Book className="h-5 w-5 text-purple-500" />;
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
                    {notification.title.toLowerCase().includes("enrollment approved") && user?.role === 'student' ? 
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

export default NotificationsList;
