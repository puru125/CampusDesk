
import { Filter } from "lucide-react";
import { useState } from "react";
import { Class } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimetableFiltersProps {
  classes?: Class[];
  selectedClass: string | null;
  onClassChange: (classId: string | null) => void;
}

const TimetableFilters = ({
  classes = [],
  selectedClass,
  onClassChange,
}: TimetableFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex gap-2 w-full md:w-auto">
        <div className="w-full md:w-64">
          <Select
            value={selectedClass || ""}
            onValueChange={(value) => onClassChange(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes?.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TimetableFilters;
