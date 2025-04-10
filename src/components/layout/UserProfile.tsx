
import React from "react";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileProps {
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const { user } = useAuth();

  return (
    <div className="p-4 space-y-4 border-t">
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{user?.full_name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center w-full p-2 text-sm font-medium rounded-md hover:bg-gray-200 text-gray-700 transition-colors"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
