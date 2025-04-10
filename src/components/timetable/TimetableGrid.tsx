
import { Clock, User, MapPin } from "lucide-react";
import { TimetableEntry } from "@/types";

interface TimetableGridProps {
  timetableEntries?: TimetableEntry[];
  isLoading: boolean;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

const TimetableGrid = ({ timetableEntries = [], isLoading }: TimetableGridProps) => {
  // Helper function to get entries for a specific day and time
  const getEntriesForDayAndTime = (day: number, timeSlot: string) => {
    return timetableEntries.filter(entry => 
      entry.day_of_week === day && 
      entry.start_time <= timeSlot && 
      entry.end_time > timeSlot
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-institute-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 bg-gray-50">
          <div className="p-3 text-xs font-medium text-gray-500 border-r">
            Time / Day
          </div>
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day} className="p-3 text-xs font-medium text-gray-500 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {TIME_SLOTS.map((timeSlot, timeIndex) => (
          <div key={timeSlot} className="grid grid-cols-8 border-t">
            <div className="p-3 text-xs font-medium text-gray-500 border-r bg-gray-50">
              {timeSlot}
            </div>
            {DAYS_OF_WEEK.map((_, dayIndex) => {
              const entries = getEntriesForDayAndTime(dayIndex + 1, timeSlot);
              return (
                <div key={`${dayIndex}-${timeIndex}`} className="p-1 border-r last:border-r-0 min-h-20">
                  {entries.map(entry => (
                    <div 
                      key={entry.id} 
                      className="bg-institute-100 rounded p-2 text-xs mb-1 overflow-hidden"
                    >
                      <div className="font-medium text-institute-600">
                        {entry.subject?.name}
                      </div>
                      <div className="flex items-center mt-1 text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        <span>{entry.teacher?.full_name}</span>
                      </div>
                      <div className="flex items-center mt-1 text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{entry.class?.room}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableGrid;
