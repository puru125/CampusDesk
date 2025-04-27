
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartContainerProps {
  title: string;
  children: React.ReactElement;
}

const ChartContainer = ({ title, children }: ChartContainerProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] w-full">
        {children}
      </div>
    </CardContent>
  </Card>
);

export default ChartContainer;
