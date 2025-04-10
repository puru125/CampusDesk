
import PageHeader from "@/components/ui/page-header";
import { Bell } from "lucide-react";
import NotificationsList from "@/components/notifications/NotificationsList";

const TeacherNotificationsPage = () => {
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="View your latest notifications and updates"
        icon={Bell}
      />
      
      <div className="mt-6">
        <NotificationsList showViewAll={false} />
      </div>
    </div>
  );
};

export default TeacherNotificationsPage;
