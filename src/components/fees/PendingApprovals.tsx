
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Search, AlertTriangle, Check, X, FileText } from "lucide-react";

interface PaymentTransaction {
  id: string;
  student_id: string;
  fee_structure_id: string | null;
  amount: number;
  payment_method: string;
  payment_date: string;
  receipt_number: string;
  transaction_id: string | null;
  status: string;
  created_at: string;
  student?: {
    full_name: string;
    email: string;
    enrollment_number: string;
  };
}

const PendingApprovals = () => {
  const { user } = useAuth();
  const [pendingPayments, setPendingPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [remarks, setRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          id,
          student_id,
          fee_structure_id,
          amount,
          payment_method,
          payment_date,
          receipt_number,
          transaction_id,
          status,
          created_at,
          students:student_id (
            users:user_id (
              full_name,
              email
            ),
            enrollment_number
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedData: PaymentTransaction[] = data.map(payment => ({
          id: payment.id,
          student_id: payment.student_id,
          fee_structure_id: payment.fee_structure_id,
          amount: payment.amount,
          payment_method: payment.payment_method,
          payment_date: payment.payment_date,
          receipt_number: payment.receipt_number,
          transaction_id: payment.transaction_id,
          status: payment.status,
          created_at: payment.created_at,
          student: payment.students ? {
            full_name: payment.students.users?.full_name,
            email: payment.students.users?.email,
            enrollment_number: payment.students.enrollment_number
          } : undefined
        }));
        
        setPendingPayments(formattedData);
      }
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openApproveDialog = (payment: PaymentTransaction) => {
    setSelectedPayment(payment);
    setActionType("approve");
    setRemarks("");
  };

  const openRejectDialog = (payment: PaymentTransaction) => {
    setSelectedPayment(payment);
    setActionType("reject");
    setRemarks("");
  };

  const closeDialog = () => {
    setSelectedPayment(null);
    setActionType(null);
    setRemarks("");
  };

  const processPayment = async () => {
    if (!selectedPayment || !actionType || !user) return;

    setIsProcessing(true);
    try {
      // Updated this line to use the correct string literal type for the function name
      const functionName = actionType === "approve" ? "approve_payment" : "reject_payment";
      
      const functionBody = {
        p_admin_id: user.id,
        p_payment_id: selectedPayment.id,
        p_admin_remarks: remarks
      };
      
      const { data, error } = await supabase.rpc(
        functionName,
        functionBody
      );
      
      if (error) throw error;
      
      // Update local state
      setPendingPayments(pendingPayments.filter(p => p.id !== selectedPayment.id));
      
      toast({
        title: "Success",
        description: `Payment ${actionType === "approve" ? "approved" : "rejected"} successfully`,
      });
      
      closeDialog();
    } catch (error) {
      console.error(`Error ${actionType}ing payment:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionType} payment`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayments = pendingPayments.filter(payment => {
    return (
      payment.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.enrollment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.transaction_id && payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, enrollment number, receipt..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-institute-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow">
          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center">
              <Check className="h-12 w-12 mx-auto text-green-500" />
              <h3 className="mt-2 text-lg font-medium">No pending payments</h3>
              <p className="mt-1 text-gray-500">
                All payment approvals have been processed
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.receipt_number}</TableCell>
                    <TableCell>
                      <div className="font-medium">{payment.student?.full_name}</div>
                      <div className="text-sm text-gray-500">{payment.student?.enrollment_number}</div>
                    </TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payment.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(payment.payment_date), 'PP')}</TableCell>
                    <TableCell>{payment.transaction_id || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openApproveDialog(payment)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRejectDialog(payment)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Approve/Reject Dialog */}
      <Dialog open={!!selectedPayment && !!actionType} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Payment" : "Reject Payment"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Confirm payment approval for this transaction."
                : "Provide a reason for rejecting this payment."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Student</div>
                  <div className="font-medium">{selectedPayment.student?.full_name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Receipt No.</div>
                  <div className="font-medium">{selectedPayment.receipt_number}</div>
                </div>
                <div>
                  <div className="text-gray-500">Amount</div>
                  <div className="font-medium">₹{selectedPayment.amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Payment Method</div>
                  <div className="font-medium">{selectedPayment.payment_method}</div>
                </div>
                <div>
                  <div className="text-gray-500">Date</div>
                  <div className="font-medium">{format(new Date(selectedPayment.payment_date), 'PP')}</div>
                </div>
                <div>
                  <div className="text-gray-500">Transaction ID</div>
                  <div className="font-medium">{selectedPayment.transaction_id || "N/A"}</div>
                </div>
              </div>
              
              <div className="pt-2">
                <label className="text-sm font-medium">
                  {actionType === "approve" ? "Remarks (Optional)" : "Reason for Rejection"}
                </label>
                <Textarea
                  placeholder={actionType === "approve" ? "Add any comments..." : "Provide reason for rejection..."}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-1"
                  required={actionType === "reject"}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={processPayment} 
              disabled={isProcessing || (actionType === "reject" && !remarks)}
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {isProcessing ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingApprovals;
