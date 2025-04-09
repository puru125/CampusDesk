
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const passwordResetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

interface PasswordResetProps {
  onComplete: () => void;
}

const PasswordReset = ({ onComplete }: PasswordResetProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordResetFormValues) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('reset_password_after_first_login', {
        p_user_id: user.id,
        p_new_password: data.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password reset successful",
        description: "Your password has been updated successfully.",
        variant: "default",
      });
      
      // Update the local user state to reflect the password change
      const updatedUser = { ...user, is_first_login: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Notify parent component that the reset is complete
      onComplete();
    } catch (err) {
      console.error('Password reset error:', err);
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Reset Your Password</h2>
        <p className="text-gray-600 mt-1">
          This is your first login. Please set a new secure password.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Enter new password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                <div className="mt-2 text-xs space-y-1 text-gray-500">
                  <p>Password must:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <PasswordRequirement 
                      text="Be at least 8 characters" 
                      met={field.value.length >= 8} 
                    />
                    <PasswordRequirement 
                      text="Contain at least one uppercase letter" 
                      met={/[A-Z]/.test(field.value)} 
                    />
                    <PasswordRequirement 
                      text="Contain at least one lowercase letter" 
                      met={/[a-z]/.test(field.value)} 
                    />
                    <PasswordRequirement 
                      text="Contain at least one number" 
                      met={/[0-9]/.test(field.value)} 
                    />
                    <PasswordRequirement 
                      text="Contain at least one special character" 
                      met={/[^A-Za-z0-9]/.test(field.value)} 
                    />
                  </ul>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Confirm new password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-institute-500 hover:bg-institute-600" 
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

interface PasswordRequirementProps {
  text: string;
  met: boolean;
}

const PasswordRequirement = ({ text, met }: PasswordRequirementProps) => (
  <li className={`flex items-center ${met ? 'text-green-600' : 'text-gray-500'}`}>
    {met ? (
      <CheckCircle className="h-3 w-3 mr-1.5" />
    ) : (
      <div className="h-3 w-3 mr-1.5 rounded-full border border-gray-400" />
    )}
    <span>{text}</span>
  </li>
);

export default PasswordReset;
