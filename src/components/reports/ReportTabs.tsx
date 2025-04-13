
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart, PieChart, UserCircle, DollarSign } from "lucide-react";

interface ReportTabItem {
  value: string;
  label: string;
  icon: ReactNode;
  condition?: boolean;
}

interface ReportTabsProps {
  tabs: ReportTabItem[];
  defaultValue?: string;
  children: ReactNode;
}

const ReportTabs = ({ tabs, defaultValue = "attendance", children }: ReportTabsProps) => {
  // Filter out tabs with condition set to false before rendering
  const filteredTabs = tabs.filter(tab => tab.condition !== false);
  
  // Set a valid default value (first tab if the provided default isn't in filtered tabs)
  const validDefaultValue = filteredTabs.some(tab => tab.value === defaultValue) 
    ? defaultValue 
    : filteredTabs.length > 0 ? filteredTabs[0].value : "";

  return (
    <Tabs defaultValue={validDefaultValue} className="mt-6">
      <TabsList className="flex flex-wrap gap-1">
        {filteredTabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex items-center">
            {tab.icon}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
};

export default ReportTabs;

export const getDefaultReportTabs = (isAdmin: boolean = false, showStudentOverview: boolean = false) => [
  {
    value: "attendance",
    label: "Attendance Reports",
    icon: <Users className="mr-2 h-4 w-4" />
  },
  {
    value: "performance",
    label: "Performance Analysis",
    icon: <BarChart className="mr-2 h-4 w-4" />
  },
  {
    value: "financial",
    label: "Financial Reports",
    icon: <DollarSign className="mr-2 h-4 w-4" />,
    condition: isAdmin
  },
  {
    value: "student",
    label: "Student Overview",
    icon: <UserCircle className="mr-2 h-4 w-4" />,
    condition: showStudentOverview
  }
];
