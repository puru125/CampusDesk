
import { useState } from "react";
import YearSessionFilter from "../filters/YearSessionFilter";
import { YearSessionValues } from "@/lib/validation-rules";

interface ReportFilterProps {
  onFilterChange: (filters: ReportFilters) => void;
}

export interface ReportFilters {
  year?: string;
  session?: string;
}

const ReportFilter = ({ onFilterChange }: ReportFilterProps) => {
  const [filters, setFilters] = useState<ReportFilters>({});
  
  const handleYearSessionChange = (values: YearSessionValues) => {
    const newFilters = {
      ...filters,
      year: values.year,
      session: values.session
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  return (
    <div className="flex justify-between items-center mb-6">
      <YearSessionFilter onFilterChange={handleYearSessionChange} />
    </div>
  );
};

export default ReportFilter;
