
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
  return (
    <Tabs defaultValue={defaultValue} className="mt-6">
      <TabsList>
        {tabs.map((tab) => 
          (!tab.condition || tab.condition === true) && (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          )
        )}
      </TabsList>
      {children}
    </Tabs>
  );
};

export default ReportTabs;

export const getDefaultReportTabs = (isAdmin: boolean = false) => [
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
    value: "grades",
    label: "Grade Distribution",
    icon: <PieChart className="mr-2 h-4 w-4" />,
    condition: !isAdmin
  },
  {
    value: "student",
    label: "Student Overview",
    icon: <UserCircle className="mr-2 h-4 w-4" />,
    condition: false
  }
];
