
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  user: string;
}

interface RecentActivityCardProps {
  activities: Activity[];
}

const RecentActivityCard = ({ activities }: RecentActivityCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Latest updates from the system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border-l-4 border-institute-300 pl-4 py-2 -ml-1 bg-gray-50 rounded-r-md"
          >
            <h4 className="font-medium text-sm">{activity.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
            <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{activity.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{activity.time}</span>
              </div>
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span>{activity.user}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
