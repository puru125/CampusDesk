
import { ReactNode, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ChartContainerProps {
  title: string;
  onDownload?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  hasData?: boolean;
  children: ReactNode;
}

const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ title, onDownload, isLoading, emptyMessage, hasData = true, children }, ref) => {
    return (
      <Card ref={ref}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {onDownload && (
            <Button onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
            </div>
          ) : hasData ? (
            children
          ) : (
            <div className="text-center py-8 text-gray-500">
              {emptyMessage || "No data available"}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

ChartContainer.displayName = "ChartContainer";

export default ChartContainer;
