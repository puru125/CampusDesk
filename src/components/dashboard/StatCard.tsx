
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trendText?: string;
  trendValue?: string;
  trendDirection?: "up" | "down" | "neutral";
  trend?: "up" | "down" | "neutral";
  changePercentage?: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trendText,
  trendValue,
  trendDirection = "neutral",
  trend,
  changePercentage,
}: StatCardProps) => {
  // Use trend prop if provided, otherwise use trendDirection
  const displayTrendDirection = trend || trendDirection;
  
  // Format the trend value with percentage if changePercentage is provided
  const displayTrendValue = changePercentage !== undefined ? 
    `${changePercentage}%` : trendValue;
  
  return (
    <Card className="hover-scale overflow-hidden relative">
      <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-primary/5 flex items-start justify-end p-2">
        <Icon className="h-6 w-6 text-primary/80" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Icon className="mr-2 h-5 w-5 text-institute-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-institute-600 to-institute-800">{value}</p>
        {trendText && (
          <CardDescription className="flex items-center mt-1">
            {trendText}
            {displayTrendValue && (
              <span
                className={`ml-1 font-semibold ${
                  displayTrendDirection === "up"
                    ? "text-green-500"
                    : displayTrendDirection === "down"
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {displayTrendValue}
              </span>
            )}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
