
import PageHeader from "@/components/ui/page-header";
import { Bell } from "lucide-react";
import NotificationsList from "@/components/notifications/NotificationsList";

const AdminNotificationsPage = () => {
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Manage system notifications and alerts"
        icon={Bell}
      />
      
      <div className="mt-6">
        <NotificationsList showViewAll={false} />
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
