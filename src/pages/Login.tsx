
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { School, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("admin");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      console.log("Attempting login with:", data.email);
      const success = await login(data.email, data.password);
      
      if (success) {
        navigate("/");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    }
  };

  const handleDemoLogin = (type: string) => {
    let email = "";
    let password = "";
    
    switch (type) {
      case "admin":
        email = "admin@ims.edu";
        password = "Admin@IMS2023";
        break;
      case "teacher":
        email = "sharma@ims.edu";
        password = "Priyasharm";
        break;
      case "student":
        email = "ravi@ims.edu";
        password = "Raviravi";
        break;
    }
    
    form.setValue("email", email);
    form.setValue("password", password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-institute-100 text-institute-600 rounded-lg mb-4">
            <School className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-center">
            Institute Management System
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to your account
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-institute-500 hover:bg-institute-600"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>

        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Demo Accounts</h3>
          <Tabs 
            defaultValue="admin" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
              <TabsTrigger value="student">Student</TabsTrigger>
            </TabsList>
            <TabsContent value="admin" className="bg-gray-50 rounded p-2">
              <div className="text-xs">
                <div className="font-medium">Admin</div>
                <div>admin@ims.edu</div>
                <div className="text-gray-400">Password: Admin@IMS2023</div>
              </div>
            </TabsContent>
            <TabsContent value="teacher" className="bg-gray-50 rounded p-2">
              <div className="text-xs">
                <div className="font-medium">Teacher</div>
                <div>sharma@ims.edu</div>
                <div className="text-gray-400">Password: Priyasharm</div>
              </div>
            </TabsContent>
            <TabsContent value="student" className="bg-gray-50 rounded p-2">
              <div className="text-xs">
                <div className="font-medium">Student</div>
                <div>ravi@ims.edu</div>
                <div className="text-gray-400">Password: Raviravi</div>
              </div>
            </TabsContent>
          </Tabs>
          <Button 
            variant="outline" 
            className="mt-2 text-xs w-full"
            onClick={() => handleDemoLogin(activeTab)}
          >
            Auto-fill {activeTab} credentials
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
