
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trendText?: string;
  trendValue?: string;
  trendDirection?: "up" | "down" | "neutral";
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trendText,
  trendValue,
  trendDirection = "neutral",
}: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Icon className="mr-2 h-5 w-5 text-institute-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        {trendText && (
          <CardDescription className="flex items-center mt-1">
            {trendText}
            {trendValue && (
              <span
                className={`ml-1 ${
                  trendDirection === "up"
                    ? "text-green-500"
                    : trendDirection === "down"
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {trendValue}
              </span>
            )}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
