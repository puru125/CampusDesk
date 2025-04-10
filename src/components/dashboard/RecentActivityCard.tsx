
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, Clock } from "lucide-react";

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
  const navigate = useNavigate();

  return (
    <Card className="h-full hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg flex items-center">
          <Bell className="mr-2 h-5 w-5 text-institute-600 dark:text-institute-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length > 0 ? (
          <div className="divide-y">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">{activity.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-institute-100 text-institute-600 dark:bg-institute-900/50 dark:text-institute-400 rounded-full">
                    {activity.user}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{activity.description}</p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-gray-400" />
                    <span>{activity.time}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                    <span>{activity.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No recent activity
          </div>
        )}
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full hover:bg-institute-50 hover:text-institute-600 dark:hover:bg-institute-900/20 dark:hover:text-institute-400"
            onClick={() => navigate("/notifications")}
          >
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
