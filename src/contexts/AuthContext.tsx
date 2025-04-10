import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, AuthState } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  updateProfile: (profileData: any) => Promise<boolean>;
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
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

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
      // Call the RPC function to authenticate
      const { data, error } = await supabase.rpc("authenticate_user", {
        p_email: email,
        p_password: password,
      });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const user: User = {
          id: data[0].id,
          email: data[0].email,
          full_name: data[0].full_name,
          role: data[0].role,
          is_first_login: data[0].is_first_login,
          created_at: "",
          updated_at: "",
        };

        // Store user in local storage
        localStorage.setItem("ims_user", JSON.stringify(user));

        // Update auth state
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        // Update last login time
        await supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", user.id);

        return true;
      } else {
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

      // Update local user data if needed
      // This depends on what fields are being updated
      
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
