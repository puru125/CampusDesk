
import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/page-header";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
}

const StudentNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockNotifications = [
      {
        id: "1",
        title: "New Assignment",
        message: "You have a new assignment for Database Systems due on November 10th.",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        type: "assignment"
      },
      {
        id: "2",
        title: "Attendance Alert",
        message: "Your attendance in Web Development is below 75%. Please improve your attendance.",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        type: "attendance"
      },
      {
        id: "3",
        title: "Fee Payment Due",
        message: "Your semester fee payment is due. Please make the payment by November 15th.",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        type: "fee"
      },
      {
        id: "4",
        title: "Course Registration",
        message: "Course registration for the next semester starts on November 20th.",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        type: "academic"
      }
    ];
    
    setNotifications(mockNotifications);
    setLoading(false);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="View your latest notifications and updates"
        icon={Bell}
      />
      
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No Notifications</h3>
              <p className="text-sm text-gray-500 mt-2">
                You don't have any notifications right now.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border-l-4 transition-all ${notification.read ? 'border-l-gray-300' : 'border-l-primary'}`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className={`text-base ${notification.read ? 'text-gray-700' : 'font-semibold'}`}>
                      {notification.title}
                    </CardTitle>
                    <span className="text-xs text-gray-500">
                      {format(new Date(notification.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{notification.message}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      notification.type === 'assignment' ? 'bg-blue-100 text-blue-800' :
                      notification.type === 'attendance' ? 'bg-yellow-100 text-yellow-800' :
                      notification.type === 'fee' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                    </span>
                    {!notification.read && (
                      <span className="ml-2 h-2 w-2 rounded-full bg-primary"></span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotificationsPage;
