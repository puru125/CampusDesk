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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { Search, AlertTriangle, Download, Filter, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  admin_remarks: string | null;
  created_at: string;
  student?: {
    full_name: string;
    email: string;
    enrollment_number: string;
  };
}

interface PaymentsListProps {
  isStudent: boolean;
  studentId?: string;
}

const PaymentsList = ({ isStudent, studentId }: PaymentsListProps) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [studentId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      let query = supabase
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
          admin_remarks,
          created_at,
          students:student_id (
            users:user_id (
              full_name,
              email
            ),
            enrollment_number
          )
        `);
      
      if (isStudent && studentId) {
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', studentId)
          .single();
        
        if (studentData) {
          query = query.eq('student_id', studentData.id);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
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
          admin_remarks: payment.admin_remarks,
          created_at: payment.created_at,
          student: payment.students ? {
            full_name: payment.students.users?.full_name,
            email: payment.students.users?.email,
            enrollment_number: payment.students.enrollment_number
          } : undefined
        }));
        
        setPayments(formattedData);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewReceipt = (payment: PaymentTransaction) => {
    setSelectedPayment(payment);
    setReceiptDialogOpen(true);
  };

  const downloadReceipt = () => {
    if (!selectedPayment) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("PAYMENT RECEIPT", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("Institute Management System", pageWidth / 2, 30, { align: "center" });
    
    doc.setDrawColor(0, 0, 0);
    doc.line(14, 35, pageWidth - 14, 35);
    
    const formattedDate = format(new Date(selectedPayment.payment_date), "PP");
    
    const receiptData = [
      ["Receipt No:", selectedPayment.receipt_number],
      ["Date:", formattedDate],
      ["Student:", selectedPayment.student?.full_name || ""],
      ["Enrollment No:", selectedPayment.student?.enrollment_number || ""],
      ["Amount:", `₹${selectedPayment.amount.toLocaleString()}`],
      ["Payment Method:", selectedPayment.payment_method],
      ["Status:", selectedPayment.status.toUpperCase()],
    ];
    
    if (selectedPayment.transaction_id) {
      receiptData.push(["Transaction ID:", selectedPayment.transaction_id]);
    }
    
    if (selectedPayment.admin_remarks) {
      receiptData.push(["Remarks:", selectedPayment.admin_remarks]);
    }
    
    autoTable(doc, {
      startY: 45,
      head: [],
      body: receiptData,
      theme: "plain",
      styles: { 
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { 
          cellWidth: 40,
          fontStyle: "bold"
        },
        1: { 
          cellWidth: 85
        }
      }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(9);
    doc.text("This is a computer-generated receipt. No signature required.", pageWidth / 2, finalY + 20, { align: "center" });
    
    if (selectedPayment.status === "completed") {
      doc.setFillColor(0, 128, 0);
      doc.setTextColor(0, 128, 0);
      doc.text("PAID", pageWidth - 30, finalY + 10);
    }
    
    doc.save(`Receipt-${selectedPayment.receipt_number}.pdf`);
    
    toast({
      title: "Receipt Downloaded",
      description: "Payment receipt has been downloaded successfully",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = (
      payment.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.enrollment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.transaction_id && payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const matchesStatus = statusFilter === "all" || !statusFilter ? true : payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={isStudent ? "Search by receipt number..." : "Search payments..."}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
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
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No payments found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || statusFilter ? 
                  "Try adjusting your search terms or filters" : 
                  isStudent ? "You haven't made any payments yet" : "No payment records available"}
              </p>
              {isStudent && (
                <Button className="mt-4" onClick={() => window.location.href = "/fees/payment/new"}>
                  Make a Payment
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No.</TableHead>
                  {!isStudent && <TableHead>Student</TableHead>}
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.receipt_number}</TableCell>
                    {!isStudent && (
                      <TableCell>
                        <div className="font-medium">{payment.student?.full_name}</div>
                        <div className="text-sm text-gray-500">{payment.student?.enrollment_number}</div>
                      </TableCell>
                    )}
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payment.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(payment.payment_date), 'PP')}</TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewReceipt(payment)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Receipt details for transaction {selectedPayment?.receipt_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <Card className="border-dashed">
                <CardHeader className="text-center border-b pb-2">
                  <CardTitle className="text-xl">PAYMENT RECEIPT</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Receipt No:</span>
                      <span className="font-medium">{selectedPayment.receipt_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium">{format(new Date(selectedPayment.payment_date), 'PP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Student:</span>
                      <span className="font-medium">{selectedPayment.student?.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Enrollment No:</span>
                      <span className="font-medium">{selectedPayment.student?.enrollment_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-medium">₹{selectedPayment.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method:</span>
                      <span className="font-medium">{selectedPayment.payment_method}</span>
                    </div>
                    {selectedPayment.transaction_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transaction ID:</span>
                        <span className="font-medium">{selectedPayment.transaction_id}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium capitalize ${
                        selectedPayment.status === 'completed' ? 'text-green-600' :
                        selectedPayment.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {selectedPayment.status}
                      </span>
                    </div>
                    {selectedPayment.admin_remarks && (
                      <div className="pt-2">
                        <span className="text-gray-500 block">Remarks:</span>
                        <span className="font-medium">{selectedPayment.admin_remarks}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-xs text-gray-500">
                    This is a computer-generated receipt.
                  </div>
                  {selectedPayment.status === 'completed' && (
                    <div className="text-green-600 font-medium text-xs uppercase border border-green-600 px-2 py-1 rounded-full">
                      Paid
                    </div>
                  )}
                </CardFooter>
              </Card>
              
              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                {selectedPayment.status === 'completed' && (
                  <Button onClick={downloadReceipt}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsList;
