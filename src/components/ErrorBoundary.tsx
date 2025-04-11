
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    console.error("ErrorBoundary caught an error:", error);
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="max-w-xl mx-auto my-8">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="flex items-center text-red-600 dark:text-red-400">
              <AlertTriangle className="mr-2" />
              An error occurred
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                The application encountered an error. Please try refreshing the page.
              </p>
              {this.state.error && (
                <div className="bg-muted p-3 rounded-md text-xs overflow-auto mb-2">
                  <strong>Error:</strong> {this.state.error.toString()}
                </div>
              )}
              <Button 
                onClick={() => window.location.reload()} 
                size="sm"
                className="mt-2"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
