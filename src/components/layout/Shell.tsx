
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import { 
  LogOut, 
  User
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import NotificationCounter from "@/components/notifications/NotificationCounter";

interface ShellProps {
  children: ReactNode;
  className?: string;
}

const Shell = ({ children, className }: ShellProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navigateToNotifications = () => {
    if (user?.role === 'admin') {
      navigate("/admin/notifications");
    } else if (user?.role === 'teacher') {
      navigate("/teacher/notifications");
    } else if (user?.role === 'student') {
      navigate("/student/notifications");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar>
        {children}
      </Sidebar>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-heading font-semibold text-institute-500">
              Institute Management System
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationCounter onClick={navigateToNotifications} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-institute-100 text-institute-800">
                      {user ? getInitials(user.full_name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main
          className={cn(
            "flex-1 overflow-auto p-6 bg-gray-50",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Shell;
