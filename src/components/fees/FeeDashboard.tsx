
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { DollarSign, Clock, CreditCard, AlertTriangle } from "lucide-react";

interface FeeSummary {
  total_due: number;
  total_paid: number;
  pending_amount: number;
  last_payment_date: string | null;
  payment_status: string;
}

const FeeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  useEffect(() => {
    if (user) {
      fetchFeeSummary();
    }
  }, [user]);

  const fetchFeeSummary = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        // Fetch student-specific fee summary
        const { data: student } = await supabase
          .from('students')
          .select('id, total_fees_due, total_fees_paid, last_payment_date, fee_status')
          .eq('user_id', user?.id)
          .single();

        if (student) {
          setSummary({
            total_due: student.total_fees_due || 0,
            total_paid: student.total_fees_paid || 0,
            pending_amount: (student.total_fees_due || 0) - (student.total_fees_paid || 0),
            last_payment_date: student.last_payment_date,
            payment_status: student.fee_status || 'pending'
          });
        }
      } else if (isAdmin) {
        // Fetch admin dashboard fee summary
        const { data } = await supabase
          .from('admin_dashboard_stats_view')
          .select('*')
          .single();

        if (data) {
          // Calculate payment stats from admin dashboard data
          setSummary({
            total_due: data.total_students * 10000, // Example calculation
            total_paid: data.recent_fee_collections || 0,
            pending_amount: (data.total_students * 10000) - (data.recent_fee_collections || 0),
            last_payment_date: null,
            payment_status: 'mixed'
          });
        }
      }
    } catch (error) {
      console.error("Error fetching fee summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="min-h-[140px] animate-pulse bg-gray-100">
            <CardHeader className="p-6"></CardHeader>
            <CardContent></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-10 w-10 text-yellow-500 mb-2" />
        <h3 className="text-lg font-medium">No fee information available</h3>
        <p className="text-gray-500">Please contact the administration for details.</p>
      </div>
    );
  }

  const paymentPercentage = summary.total_due > 0 
    ? Math.min(Math.round((summary.total_paid / summary.total_due) * 100), 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fee Due</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.total_due.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {isStudent ? "Your total fees for current year" : "Total fees across all students"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.total_paid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {summary.last_payment_date && `Last payment on ${format(new Date(summary.last_payment_date), 'PP')}`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.pending_amount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {isStudent && summary.pending_amount <= 0 
                ? "All fees paid" 
                : "Amount still to be cleared"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${summary.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {summary.payment_status}
            </div>
            <Progress value={paymentPercentage} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{paymentPercentage}% Complete</p>
          </CardContent>
        </Card>
      </div>

      {isStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Payment Progress</CardTitle>
            <CardDescription>Your payment status and upcoming dues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Overall Progress</div>
                  <div className="text-sm text-gray-500">{paymentPercentage}%</div>
                </div>
                <Progress value={paymentPercentage} className="h-2 mt-2" />
              </div>
              <div className="text-sm">
                {summary.pending_amount > 0 ? (
                  <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Payment Due</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            You have an outstanding balance of ₹{summary.pending_amount.toLocaleString()}. Please make payment at your earliest convenience to avoid late fees.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md bg-green-50 p-4 border border-green-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-5 w-5 text-green-400">✓</div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">All Payments Clear</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>You have no pending payments. Thank you for maintaining your payment schedule.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeeDashboard;
