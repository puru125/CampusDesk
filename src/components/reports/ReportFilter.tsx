
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface ReportFilterProps {
  onFilterChange: (period: string, department: string) => void;
}

const ReportFilter = ({ onFilterChange }: ReportFilterProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const handleApplyFilter = () => {
    onFilterChange(selectedPeriod, selectedDepartment);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1">
            <label htmlFor="period" className="text-sm font-medium">
              Time Period
            </label>
            <Select
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger id="period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex-1">
            <label htmlFor="department" className="text-sm font-medium">
              Department
            </label>
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="bus">Business</SelectItem>
                <SelectItem value="eng">Engineering</SelectItem>
                <SelectItem value="edu">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleApplyFilter}>Apply Filter</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportFilter;
