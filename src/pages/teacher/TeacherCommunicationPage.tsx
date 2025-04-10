
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, MessageCircle, Send, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: string;
}

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
}

const TeacherCommunicationPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTeacherId();
    }
  }, [user]);

  useEffect(() => {
    if (teacherId) {
      fetchNotifications();
      fetchMessages();
    }
  }, [teacherId]);

  const fetchTeacherId = async () => {
    try {
      const { data, error } = await extendedSupabase
        .from('teachers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setTeacherId(data.id);
      }
    } catch (error) {
      console.error("Error fetching teacher ID:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Using mock data for now, but in a real app, you would fetch from the database
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Semester Schedule",
          message: "The new semester schedule has been published. Please review your assigned classes.",
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          is_read: false,
          type: "announcement"
        },
        {
          id: "2",
          title: "Faculty Meeting",
          message: "There will be a faculty meeting on Friday at 3:00 PM in Room 201.",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          is_read: true,
          type: "event"
        },
        {
          id: "3",
          title: "Grade Submission Reminder",
          message: "Please submit all pending grades by the end of this week.",
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          is_read: false,
          type: "reminder"
        }
      ];
      
      setNotifications(mockNotifications);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Could not fetch notifications",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      // Mock data for messages
      const mockMessages: Message[] = [
        {
          id: "1",
          sender: {
            id: "s1",
            name: "John Doe",
            role: "student"
          },
          content: "Hello Professor, I have a question about the assignment due next week.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: false
        },
        {
          id: "2",
          sender: {
            id: "a1",
            name: "Dr. Sarah Wilson",
            role: "admin"
          },
          content: "Please remember to submit your course materials for the upcoming semester.",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          isRead: true
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true } 
          : notification
      )
    );
    
    // In a real app, you would also update the database
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === messageId 
          ? { ...message, isRead: true } 
          : message
      )
    );
    
    // In a real app, you would also update the database
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
    
    // In a real app, you would also update the database
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "announcement":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-green-100 text-green-800";
      case "reminder":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSenderInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const getSenderColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "student":
        return "bg-blue-100 text-blue-800";
      case "teacher":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <PageHeader
        title="Communication Center"
        description="View notifications and messages"
        icon={Bell}
      />
      
      <div className="mt-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              {notifications.filter(n => !n.is_read).length > 0 && (
                <Badge className="ml-2 bg-red-500">{notifications.filter(n => !n.is_read).length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center">
              <MessageCircle className="mr-2 h-4 w-4" />
              Messages
              {messages.filter(m => !m.isRead).length > 0 && (
                <Badge className="ml-2 bg-red-500">{messages.filter(m => !m.isRead).length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="notifications">
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
                      className={`border-l-4 transition-all ${notification.is_read ? 'border-l-gray-300' : 'border-l-primary'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-1">
                              <h3 className={`text-base ${notification.is_read ? 'font-normal' : 'font-semibold'}`}>
                                {notification.title}
                              </h3>
                              {!notification.is_read && (
                                <Badge className="ml-2 bg-blue-500">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <div className="flex items-center mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                {format(new Date(notification.created_at), "MMM d, h:mm a")}
                              </span>
                            </div>
                          </div>
                          <div className="flex">
                            {!notification.is_read && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="mr-2"
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                Mark as Read
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => dismissNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="messages">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            JD
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <h4 className="font-medium">John Doe</h4>
                          <p className="text-xs text-gray-500">Student</p>
                        </div>
                        <Badge className="ml-auto bg-blue-500">1</Badge>
                      </div>
                      
                      <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <Avatar>
                          <AvatarFallback className="bg-purple-100 text-purple-800">
                            SW
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <h4 className="font-medium">Dr. Sarah Wilson</h4>
                          <p className="text-xs text-gray-500">Admin</p>
                        </div>
                      </div>
                      
                      <Button className="w-full" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        View All Contacts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium">No Messages</h3>
                        <p className="text-sm text-gray-500 mt-2">
                          You don't have any messages right now.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`p-4 rounded-lg border ${message.isRead ? 'bg-white' : 'bg-blue-50'}`}
                            onClick={() => markMessageAsRead(message.id)}
                          >
                            <div className="flex items-start">
                              <Avatar>
                                <AvatarFallback className={getSenderColor(message.sender.role)}>
                                  {getSenderInitials(message.sender.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-3 flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <h4 className="font-medium">{message.sender.name}</h4>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(message.timestamp), "MMM d, h:mm a")}
                                  </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                                <div className="flex justify-end mt-2">
                                  <Button size="sm">
                                    <Send className="mr-2 h-4 w-4" />
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherCommunicationPage;
