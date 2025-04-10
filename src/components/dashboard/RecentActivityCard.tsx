
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Bell className="mr-2 h-5 w-5 text-institute-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{activity.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                    {activity.user}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{activity.time}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{activity.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent activity
          </div>
        )}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => navigate("/notifications")}
        >
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
