
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  isFirstLogin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  setUser: () => {},
  isFirstLogin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored user in localStorage (for session persistence)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsFirstLogin(parsedUser.is_first_login);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log(`Attempting to login with email: ${email}`);

      // Use Supabase RPC to authenticate user
      const { data, error } = await supabase.rpc('authenticate_user', {
        p_email: email,
        p_password: password
      });
      
      console.log("Authentication response:", data, error);
      
      if (error) {
        console.error("Authentication error:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const userData = data[0];
        console.log("User data:", userData);
        
        const authenticatedUser: User = {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role as UserRole,
          is_first_login: userData.is_first_login,
          created_at: new Date().toISOString(), // We don't get this from the function
          updated_at: new Date().toISOString()  // We don't get this from the function
        };
        
        setUser(authenticatedUser);
        setIsFirstLogin(authenticatedUser.is_first_login);
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${authenticatedUser.full_name}!`,
        });
      } else {
        console.error("No user data returned");
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error("Login error:", error);
      const message = error instanceof Error ? error.message : 'Failed to login';
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsFirstLogin(false);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setUser,
        isFirstLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
