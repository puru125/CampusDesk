
import React from "react";
import { LucideIcon } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

const PageHeader = ({
  title,
  description,
  icon: Icon,
  children,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b">
      <div className="flex items-center gap-2 mb-4 md:mb-0">
        {Icon && <Icon className="h-6 w-6 text-institute-600" />}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
  );
};

export default PageHeader;
