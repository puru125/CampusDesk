
import { PageHeader } from "@/components/ui/page-header";
import { Bell } from "lucide-react";
import StudentNotificationsList from "@/components/student/StudentNotificationsList";

const StudentNotificationsPage = () => {
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="View your latest notifications and updates"
        icon={Bell}
      />
      
      <div className="mt-6">
        <StudentNotificationsList showViewAll={false} />
      </div>
    </div>
  );
};

export default StudentNotificationsPage;
