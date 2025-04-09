
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
  changePercentage?: number;
  trend?: "up" | "down" | "neutral";
  trendText?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  className,
  changePercentage,
  trend = "neutral",
  trendText,
}: StatCardProps) => {
  return (
    <Card className={cn("card-hover", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            
            {(changePercentage !== undefined || trendText) && (
              <p className="text-xs font-medium flex items-center mt-1">
                <span
                  className={cn(
                    "mr-1",
                    trend === "up" && "text-green-600",
                    trend === "down" && "text-red-600",
                    trend === "neutral" && "text-gray-500"
                  )}
                >
                  {changePercentage !== undefined && (
                    <>
                      {trend === "up" && "↑"}
                      {trend === "down" && "↓"}
                      {trend === "neutral" && "→"} {Math.abs(changePercentage)}%
                    </>
                  )}
                </span>
                {trendText && <span className="text-gray-500">{trendText}</span>}
              </p>
            )}
          </div>
          <div className="rounded-full p-2 bg-institute-50">
            <Icon className="h-5 w-5 text-institute-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
