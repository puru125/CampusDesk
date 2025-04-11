
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface StatCardProps {
  title: string;
  isLoading?: boolean;
  value: ReactNode;
}

const StatCard = ({ title, isLoading, value }: StatCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-center">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
