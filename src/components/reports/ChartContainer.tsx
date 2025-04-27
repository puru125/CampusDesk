
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ChartContainerProps {
  title: string;
  children: React.ReactElement;
  isLoading?: boolean;
  hasData?: boolean;
  emptyMessage?: string;
  className?: string;
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ title, children, isLoading, hasData, emptyMessage, className }, ref) => (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={ref} className="h-[300px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {emptyMessage || "No data available"}
            </div>
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  )
);

ChartContainer.displayName = "ChartContainer";

export default ChartContainer;
