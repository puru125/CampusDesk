
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
import PasswordReset from "@/components/auth/PasswordReset";
import ProfileCompletion from "@/components/profile/ProfileCompletion";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";

const Dashboard = () => {
  const { user, isFirstLogin } = useAuth();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check if it's first login
      if (isFirstLogin) {
        setShowPasswordReset(true);
        setIsLoading(false);
        return;
      }

      // Check profile completion percentage
      try {
        // Get profile completion percentage from DB
        const { data, error } = await supabase
          .from('users')
          .select('profile_completion_percentage')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const percentage = data?.profile_completion_percentage || 0;
        setProfileCompletionPercentage(percentage);
        
        // If profile is incomplete, show profile completion form
        if (percentage < 100 && user.role !== 'admin') {
          setShowProfileCompletion(true);
        }
      } catch (error) {
        console.error("Error checking profile completion:", error);
      }

      setIsLoading(false);
    };

    checkUserStatus();
  }, [user, isFirstLogin]);

  const handlePasswordResetComplete = () => {
    setShowPasswordReset(false);
    
    // If user role is not admin, show profile completion form next
    if (user && user.role !== 'admin') {
      setShowProfileCompletion(true);
    }
  };

  const handleProfileCompletionFinished = () => {
    setShowProfileCompletion(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-institute-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showPasswordReset) {
    return <PasswordReset onComplete={handlePasswordResetComplete} />;
  }

  if (showProfileCompletion) {
    return (
      <ProfileCompletion 
        userId={user.id} 
        userRole={user.role as UserRole} 
        currentPercentage={profileCompletionPercentage}
        onComplete={handleProfileCompletionFinished} 
      />
    );
  }

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    default:
      return <div>Unknown role</div>;
  }
};

export default Dashboard;
