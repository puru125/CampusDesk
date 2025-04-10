
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationsList from "./NotificationsList";

interface NotificationCounterProps {
  onClick?: () => void;
}

const NotificationCounter = ({ onClick }: NotificationCounterProps) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserEntityId();
    }
  }, [user]);

  useEffect(() => {
    if (entityId || user?.role === 'admin') {
      fetchUnreadCount();
      
      // Set up real-time listener for notifications
      const table = getUserNotificationsTable();
      
      const channel = supabase
        .channel('unread-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table
          },
          () => {
            fetchUnreadCount();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      
      let query;
      
      if (user?.role === 'admin') {
        query = supabase
          .from('admin_notifications')
          .select('id', { count: 'exact' })
          .eq('is_read', false);
      } else if (user?.role === 'teacher' && entityId) {
        query = supabase
          .from('teacher_notifications')
          .select('id', { count: 'exact' })
          .eq('teacher_id', entityId)
          .eq('is_read', false);
      } else if (user?.role === 'student' && entityId) {
        query = supabase
          .from('student_notifications')
          .select('id', { count: 'exact' })
          .eq('student_id', entityId)
          .eq('is_read', false);
      } else {
        setLoading(false);
        return;
      }
      
      const { count, error } = await query;

      if (error) throw error;
      
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOutside = () => {
    setOpen(false);
  };

  const viewAllNotifications = () => {
    setOpen(false);
    if (onClick) {
      onClick();
    } else {
      // Navigate based on role
      switch (user?.role) {
        case 'admin':
          window.location.href = "/admin/notifications";
          break;
        case 'teacher':
          window.location.href = "/teacher/notifications";
          break;
        case 'student':
          window.location.href = "/student/notifications";
          break;
        default:
          window.location.href = "/notifications";
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(true)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && !loading && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="font-medium">Recent Notifications</div>
          <p className="text-sm text-gray-500">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="max-h-96 overflow-auto">
          <NotificationsList limit={5} showViewAll={false} />
        </div>
        <div className="p-4 border-t">
          <Button variant="outline" size="sm" className="w-full" onClick={viewAllNotifications}>
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCounter;
