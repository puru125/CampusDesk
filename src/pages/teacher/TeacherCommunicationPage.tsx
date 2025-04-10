
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Send, Users } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, {
    message: 'Title must be at least 5 characters.',
  }),
  message: z.string().min(10, {
    message: 'Message must be at least 10 characters.',
  }),
  student_id: z.string().min(1, {
    message: 'Please select a student.',
  }),
});

type Student = {
  id: string;
  first_name: string;
  last_name: string;
};

type Message = {
  id: string;
  title: string;
  message: string;
  student_id: string;
  created_at: string;
  student?: {
    first_name: string;
    last_name: string;
  };
};

const TeacherCommunicationPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('compose');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      message: '',
      student_id: '',
    },
  });

  useEffect(() => {
    if (user) {
      fetchTeacherId();
    }
  }, [user]);

  useEffect(() => {
    if (teacherId) {
      fetchStudents();
      fetchMessages();
      
      // Set up real-time listener for new messages
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'teacher_messages',
            filter: `teacher_id=eq.${teacherId}`
          },
          (payload) => {
            // Fetch the student information for the new message
            fetchMessageWithStudent(payload.new.id);
            toast({
              title: 'New Message',
              description: 'You have received a new message',
            });
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [teacherId]);

  const fetchTeacherId = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setTeacherId(data.id);
      }
    } catch (error) {
      console.error('Error fetching teacher ID:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      if (!teacherId) return;

      // Get classes assigned to this teacher
      const { data: teacherClasses, error: classesError } = await supabase
        .from('teacher_classes')
        .select('class_id')
        .eq('teacher_id', teacherId);

      if (classesError) throw classesError;

      if (!teacherClasses || teacherClasses.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const classIds = teacherClasses.map(tc => tc.class_id);

      // Get students in these classes
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .in('class_id', classIds);

      if (error) throw error;

      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      if (!teacherId) return;

      const { data, error } = await supabase
        .from('teacher_messages')
        .select(`
          id,
          title,
          message,
          student_id,
          created_at,
          students:student_id (
            first_name,
            last_name
          )
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the Message type
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        title: msg.title,
        message: msg.message,
        student_id: msg.student_id,
        created_at: msg.created_at,
        student: msg.students ? {
          first_name: msg.students.first_name,
          last_name: msg.students.last_name
        } : undefined
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchMessageWithStudent = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('teacher_messages')
        .select(`
          id,
          title,
          message,
          student_id,
          created_at,
          students:student_id (
            first_name,
            last_name
          )
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;

      if (data) {
        const newMessage = {
          id: data.id,
          title: data.title,
          message: data.message,
          student_id: data.student_id,
          created_at: data.created_at,
          student: data.students ? {
            first_name: data.students.first_name,
            last_name: data.students.last_name
          } : undefined
        };

        setMessages(prev => [newMessage, ...prev]);
      }
    } catch (error) {
      console.error('Error fetching new message:', error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!teacherId) {
        toast({
          title: 'Error',
          description: 'Teacher ID not found. Please try again later.',
          variant: 'destructive',
        });
        return;
      }

      // Insert message in the database
      const { data, error } = await supabase
        .from('teacher_messages')
        .insert({
          title: values.title,
          message: values.message,
          teacher_id: teacherId,
          student_id: values.student_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create a notification for the student
      const { error: notificationError } = await supabase
        .from('student_notifications')
        .insert({
          title: 'New message from teacher',
          message: values.title,
          student_id: values.student_id,
          is_read: false
        });

      if (notificationError) throw notificationError;

      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
      });

      // Reset form
      form.reset();
      
      // Add new message to the list
      if (data) {
        const student = students.find(s => s.id === values.student_id);
        
        const newMessage = {
          id: data.id,
          title: data.title,
          message: data.message,
          student_id: data.student_id,
          created_at: data.created_at,
          student: student ? {
            first_name: student.first_name,
            last_name: student.last_name
          } : undefined
        };
        
        setMessages(prev => [newMessage, ...prev]);
      }
      
      // Switch to messages tab
      setActiveTab('messages');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div>
      <PageHeader
        title="Communication"
        description="Send messages to students and view your communication history"
        icon={MessageSquare}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="compose">Compose Message</TabsTrigger>
          <TabsTrigger value="messages">Message History</TabsTrigger>
        </TabsList>
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>New Message</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="student_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all-students">All Students</SelectItem>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.first_name} {student.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the student you want to send a message to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter message subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type your message here..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Message History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages found. Start communicating with your students!
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="border rounded-lg p-4 shadow-sm hover:shadow transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{message.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{message.message}</p>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <span className="font-semibold">To:</span>
                        <span className="ml-2">
                          {message.student
                            ? `${message.student.first_name} ${message.student.last_name}`
                            : 'Unknown Student'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherCommunicationPage;
