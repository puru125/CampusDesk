
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface WeekNavigationProps {
  weekStart: Date;
  weekEnd: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const WeekNavigation = ({
  weekStart,
  weekEnd,
  onPreviousWeek,
  onNextWeek
}: WeekNavigationProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onPreviousWeek}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium">
        {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
      </span>
      <Button variant="outline" size="sm" onClick={onNextWeek}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WeekNavigation;
