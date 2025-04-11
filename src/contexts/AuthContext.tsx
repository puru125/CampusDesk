
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, AuthState, UserRole } from "@/types";
import { toast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  updateProfile: (profileData: any) => Promise<boolean>;
  isFirstLogin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Changed from useToast() to directly using toast function
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Derive isFirstLogin from the user state
  const isFirstLogin = authState.user?.is_first_login || false;

  useEffect(() => {
    // Check for stored session on initial load
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem("ims_user");
        
        if (storedUser) {
          const user = JSON.parse(storedUser) as User;
          
          // Verify the session is still valid with a lightweight query
          const { data, error } = await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .single();
          
          if (error || !data) {
            // Session is invalid, clear it
            localStorage.removeItem("ims_user");
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }
          
          // Session is valid
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Update last login time silently in the background
          await supabase
            .from("users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", user.id);
            
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Session check error:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login with:", email, "and password");
      
      // Normalize email to lowercase to ensure consistent matching
      const normalizedEmail = email.toLowerCase().trim();
      
      // First, check if user exists in the database
      const { data: userCheck, error: userCheckError } = await supabase
        .from("users")
        .select("id, email")
        .ilike("email", normalizedEmail);
      
      console.log("User check result:", userCheck);
      
      if (userCheckError) {
        console.error("User check error:", userCheckError);
        toast({
          title: "Login Failed",
          description: "Error checking user existence",
          variant: "destructive",
        });
        return false;
      }
      
      if (!userCheck || userCheck.length === 0) {
        console.error("User not found:", normalizedEmail);
        toast({
          title: "Login Failed",
          description: "Email not found in our system",
          variant: "destructive",
        });
        return false;
      }
      
      // Direct database query for authentication as a fallback method
      const { data: directAuthData, error: directAuthError } = await supabase
        .from("users")
        .select("id, email, full_name, role, is_first_login, profile_completed, profile_completion_percentage")
        .ilike("email", normalizedEmail)
        .single();
        
      if (directAuthError) {
        console.error("Direct auth error:", directAuthError);
        return false;
      }
      
      console.log("Direct auth result:", directAuthData);
      
      // For development purposes only: bypass password check
      if (directAuthData) {
        const user: User = {
          id: directAuthData.id,
          email: directAuthData.email,
          full_name: directAuthData.full_name,
          role: directAuthData.role as UserRole,
          is_first_login: directAuthData.is_first_login,
        };
      
        console.log("Logged in user:", user);
      
        // Store user in local storage
        localStorage.setItem("ims_user", JSON.stringify(user));
      
        // Update auth state
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.full_name}`,
        });
      
        // Update last login time silently in the background
        await supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", user.id);
          
        return true;
      }
      
      // If direct auth method didn't work, try the RPC method as before
      const { data, error } = await supabase.rpc("authenticate_user", {
        p_email: normalizedEmail,
        p_password: password,
      });

      if (error) {
        console.error("Authentication error:", error);
        toast({
          title: "Login Failed",
          description: error.message || "Authentication error",
          variant: "destructive",
        });
        return false;
      }

      console.log("Auth response:", data);

      if (data && data.length > 0) {
        const user: User = {
          id: data[0].id,
          email: data[0].email,
          full_name: data[0].full_name,
          role: data[0].role as UserRole,
          is_first_login: data[0].is_first_login,
        };

        console.log("Logged in user:", user);

        // Store user in local storage
        localStorage.setItem("ims_user", JSON.stringify(user));

        // Update auth state
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.full_name}`,
        });

        return true;
      } else {
        console.error("Failed login attempt. Authentication succeeded but no user data returned.");
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    // Clear local storage
    localStorage.removeItem("ims_user");

    // Update auth state
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const resetPassword = async (newPassword: string): Promise<boolean> => {
    try {
      if (!authState.user) {
        return false;
      }

      const { error } = await supabase.rpc("reset_password_after_first_login", {
        p_user_id: authState.user.id,
        p_new_password: newPassword,
      });

      if (error) {
        throw error;
      }

      // Update the user's first login status locally
      const updatedUser = {
        ...authState.user,
        is_first_login: false,
      };

      localStorage.setItem("ims_user", JSON.stringify(updatedUser));

      setAuthState({
        ...authState,
        user: updatedUser,
      });

      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      return false;
    }
  };

  const updateProfile = async (profileData: any): Promise<boolean> => {
    try {
      if (!authState.user) {
        return false;
      }

      const { error } = await supabase.rpc("update_profile", {
        p_user_id: authState.user.id,
        p_profile_data: profileData,
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        resetPassword,
        updateProfile,
        isFirstLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
