
import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { YearSessionValues } from "@/lib/validation-rules";

interface YearSessionFilterProps {
  onFilterChange: (filter: YearSessionValues) => void;
  years?: string[];
  sessions?: string[];
  defaultYear?: string | null;
  defaultSession?: string | null;
}

const YearSessionFilter = ({ 
  onFilterChange, 
  years = [], 
  sessions = ["Semester 1", "Semester 2"],
  defaultYear = null,
  defaultSession = null
}: YearSessionFilterProps) => {
  const [selectedYear, setSelectedYear] = useState<string | null>(defaultYear);
  const [selectedSession, setSelectedSession] = useState<string | null>(defaultSession);
  
  // Generate years if none provided (current year and 5 years back)
  const availableYears = years.length > 0 
    ? years 
    : Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - i).toString());

  // Apply default filters on initial load
  useEffect(() => {
    if (defaultYear || defaultSession) {
      onFilterChange({
        year: defaultYear || undefined,
        session: defaultSession || undefined
      });
    }
  }, []);

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    onFilterChange({ 
      year,
      session: selectedSession || undefined
    });
  };

  const handleSessionSelect = (session: string) => {
    setSelectedSession(session);
    onFilterChange({ 
      year: selectedYear || undefined,
      session
    });
  };

  const clearFilters = () => {
    setSelectedYear(null);
    setSelectedSession(null);
    onFilterChange({});
  };

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[100px]">
            {selectedYear || "Year"} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[160px] bg-white">
          <DropdownMenuGroup>
            {availableYears.map((year) => (
              <DropdownMenuItem 
                key={year} 
                onClick={() => handleYearSelect(year)}
                className="cursor-pointer"
              >
                {year}
                {selectedYear === year && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[120px]">
            {selectedSession || "Session"} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[160px] bg-white">
          <DropdownMenuGroup>
            {sessions.map((session) => (
              <DropdownMenuItem 
                key={session}
                onClick={() => handleSessionSelect(session)}
                className="cursor-pointer"
              >
                {session}
                {selectedSession === session && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {(selectedYear || selectedSession) && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      )}
    </div>
  );
};

export default YearSessionFilter;
