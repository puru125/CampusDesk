
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from "@/types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Teacher profile schema
const teacherProfileSchema = z.object({
  department: z.string().min(2, { message: "Department is required" }),
  specialization: z.string().min(2, { message: "Specialization is required" }),
  qualification: z.string().min(2, { message: "Qualification is required" }),
  joining_date: z.string().min(1, { message: "Joining date is required" }),
  contact_number: z.string().min(10, { message: "Valid contact number is required" }),
});

// Student profile schema
const studentProfileSchema = z.object({
  date_of_birth: z.string().min(1, { message: "Date of birth is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  contact_number: z.string().min(10, { message: "Valid contact number is required" }),
  guardian_name: z.string().min(2, { message: "Guardian name is required" }),
  guardian_contact: z.string().min(10, { message: "Valid guardian contact is required" }),
});

type TeacherProfileFormValues = z.infer<typeof teacherProfileSchema>;
type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;

interface ProfileCompletionProps {
  userId: string;
  userRole: UserRole;
  currentPercentage: number;
  onComplete: () => void;
}

const ProfileCompletion = ({ userId, userRole, currentPercentage, onComplete }: ProfileCompletionProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [percentage, setPercentage] = useState(currentPercentage);

  // Set up the appropriate form based on user role
  const teacherForm = useForm<TeacherProfileFormValues>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      department: "",
      specialization: "",
      qualification: "",
      joining_date: "",
      contact_number: "",
    },
  });

  const studentForm = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      date_of_birth: "",
      address: "",
      contact_number: "",
      guardian_name: "",
      guardian_contact: "",
    },
  });

  const onTeacherSubmit = async (data: TeacherProfileFormValues) => {
    await handleSubmit(data);
  };

  const onStudentSubmit = async (data: StudentProfileFormValues) => {
    await handleSubmit(data);
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update profile via RPC
      const { error } = await supabase.rpc('update_profile', {
        p_user_id: userId,
        p_profile_data: data
      });

      if (error) throw error;

      // Get updated completion percentage
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('profile_completion_percentage, profile_completed')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      setPercentage(userData.profile_completion_percentage);

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });

      // If profile is now complete, call the onComplete callback
      if (userData.profile_completed) {
        toast({
          title: "Profile Complete",
          description: "Thank you for completing your profile!",
          variant: "default",
        });
        
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md max-w-3xl mx-auto my-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
        <p className="text-gray-600 mt-1">
          Please provide the required information to complete your profile.
        </p>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Profile Completion</span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {userRole === 'teacher' ? (
        <Form {...teacherForm}>
          <form onSubmit={teacherForm.handleSubmit(onTeacherSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={teacherForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={teacherForm.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Data Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={teacherForm.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualification</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ph.D. in Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={teacherForm.control}
                name="joining_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joining Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={teacherForm.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 9812345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-institute-500 hover:bg-institute-600"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      ) : userRole === 'student' ? (
        <Form {...studentForm}>
          <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={studentForm.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={studentForm.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 9812345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={studentForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={studentForm.control}
                name="guardian_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guardian Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Parent/Guardian full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={studentForm.control}
                name="guardian_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guardian Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 9812345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-institute-500 hover:bg-institute-600"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="text-center text-gray-500">
          Unknown user role. Profile completion is not available.
        </div>
      )}
    </div>
  );
};

export default ProfileCompletion;
