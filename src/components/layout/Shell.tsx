
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import SimpleSidebar from "./SimpleSidebar"; // Using our new simple sidebar

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const { user } = useAuth();
  
  // If user is not logged in, don't show sidebar
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
        <Toaster />
      </div>
    );
  }

  // Use our simplified sidebar for logged-in users
  return (
    <>
      <SimpleSidebar>
        {children}
      </SimpleSidebar>
      <Toaster />
    </>
  );
}
