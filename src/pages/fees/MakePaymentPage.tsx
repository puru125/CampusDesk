
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Wallet, Loader2 } from "lucide-react";

interface FeeStructure {
  id: string;
  fee_type: string;
  amount: number;
  academic_year: string;
  semester: number | null;
  course_id: string | null;
  course_name?: string;
}

interface PaymentSummary {
  total_due: number;
  total_paid: number;
  pending_amount: number;
}

const paymentSchema = z.object({
  fee_structure_id: z.string({
    required_error: "Fee type is required",
  }),
  amount: z.coerce.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }).positive("Amount must be positive"),
  payment_method: z.enum(["credit_card", "debit_card", "net_banking", "upi", "cash"], {
    required_error: "Payment method is required",
  }),
  transaction_id: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// Default MCA fee structure for students with no applicable fees
const DEFAULT_MCA_FEE: FeeStructure = {
  id: "default-mca-fee",
  fee_type: "MCA Program Fee",
  amount: 45000,
  academic_year: "2024-2025",
  semester: 1,
  course_id: null,
  course_name: "Master of Computer Applications"
};

const MakePaymentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      fee_structure_id: "",
      amount: undefined,
      payment_method: "credit_card",
      transaction_id: "",
    },
  });
  
  const watchedFeeStructureId = form.watch("fee_structure_id");
  const watchedPaymentMethod = form.watch("payment_method");
  
  useEffect(() => {
    if (user) {
      fetchStudentData();
    } else {
      navigate("/login");
    }
  }, [user]);
  
  useEffect(() => {
    if (studentId) {
      fetchFeeStructures();
    }
  }, [studentId]);
  
  // Set the amount based on selected fee structure
  useEffect(() => {
    if (watchedFeeStructureId) {
      const selectedFeeStructure = feeStructures.find(fs => fs.id === watchedFeeStructureId);
      if (selectedFeeStructure) {
        form.setValue("amount", selectedFeeStructure.amount);
      }
    }
  }, [watchedFeeStructureId, feeStructures]);
  
  const fetchStudentData = async () => {
    try {
      setInitialLoading(true);
      
      if (!user?.id) return;
      
      // Get student ID and summary
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, total_fees_due, total_fees_paid, enrollment_number')
        .eq('user_id', user.id)
        .single();
        
      if (studentError) throw studentError;
      
      if (student) {
        setStudentId(student.id);
        setStudentInfo(student);
        setPaymentSummary({
          total_due: student.total_fees_due || 45000, // Default to 45000 for MCA students
          total_paid: student.total_fees_paid || 0,
          pending_amount: (student.total_fees_due || 45000) - (student.total_fees_paid || 0)
        });
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast({
        title: "Error",
        description: "Could not fetch student information",
        variant: "destructive",
      });
      navigate("/fees");
    } finally {
      setInitialLoading(false);
    }
  };
  
  const fetchFeeStructures = async () => {
    try {
      // Get applicable fee structures
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('student_course_enrollments')
        .select('course_id, academic_year, semester')
        .eq('student_id', studentId)
        .eq('status', 'approved');
        
      if (enrollmentsError) throw enrollmentsError;
      
      let fees = [];
      
      if (enrollments && enrollments.length > 0) {
        // Get fee structures for student's enrolled courses
        const courseIds = enrollments.map(e => e.course_id);
        const academicYears = [...new Set(enrollments.map(e => e.academic_year))];
        const semesters = [...new Set(enrollments.map(e => e.semester))];
        
        // Complex query to get all applicable fee structures
        const { data: feesData, error: feesError } = await supabase
          .from('fee_structures')
          .select(`
            id, 
            fee_type, 
            amount, 
            academic_year, 
            semester, 
            course_id,
            courses:course_id (name)
          `)
          .in('academic_year', academicYears)
          .or(`course_id.in.(${courseIds.join(',')}),course_id.is.null`);
          
        if (feesError) throw feesError;
        
        if (feesData && feesData.length > 0) {
          fees = feesData.map(fee => ({
            id: fee.id,
            fee_type: fee.fee_type,
            amount: fee.amount,
            academic_year: fee.academic_year,
            semester: fee.semester,
            course_id: fee.course_id,
            course_name: fee.courses?.name
          }));
        }
      }
      
      // If no fee structures are found, add a default MCA fee structure
      if (fees.length === 0) {
        // Check if the student is in MCA program based on enrollment_number pattern
        const isMCAStudent = studentInfo?.enrollment_number?.startsWith('S') || false;
        
        if (isMCAStudent) {
          fees.push(DEFAULT_MCA_FEE);
          
          // Set default fee in the student record if not already set
          if (!paymentSummary?.total_due || paymentSummary.total_due === 0) {
            await supabase
              .from('students')
              .update({ total_fees_due: DEFAULT_MCA_FEE.amount })
              .eq('id', studentId);
              
            setPaymentSummary({
              total_due: DEFAULT_MCA_FEE.amount,
              total_paid: paymentSummary?.total_paid || 0,
              pending_amount: DEFAULT_MCA_FEE.amount - (paymentSummary?.total_paid || 0)
            });
          }
        }
      }
      
      setFeeStructures(fees);
      
      // Auto-select the first fee structure if it exists
      if (fees.length > 0 && !watchedFeeStructureId) {
        form.setValue("fee_structure_id", fees[0].id);
        form.setValue("amount", fees[0].amount);
      }
    } catch (error) {
      console.error("Error fetching fee structures:", error);
      toast({
        title: "Error",
        description: "Could not fetch fee information",
        variant: "destructive",
      });
    }
  };
  
  const onSubmit = async (values: PaymentFormValues) => {
    if (!studentId) return;
    
    setLoading(true);
    try {
      // For the default MCA fee which doesn't exist in the database
      if (values.fee_structure_id === "default-mca-fee") {
        // Create a new fee structure entry
        const { data: newFeeStructure, error: feeStructureError } = await supabase
          .from('fee_structures')
          .insert({
            fee_type: DEFAULT_MCA_FEE.fee_type,
            amount: DEFAULT_MCA_FEE.amount,
            academic_year: DEFAULT_MCA_FEE.academic_year,
            semester: DEFAULT_MCA_FEE.semester,
            is_active: true
          })
          .select()
          .single();
          
        if (feeStructureError) throw feeStructureError;
        
        // Update the fee_structure_id to the newly created one
        values.fee_structure_id = newFeeStructure.id;
      }
      
      const { data, error } = await supabase.rpc(
        'record_fee_payment', 
        {
          p_student_id: studentId,
          p_fee_structure_id: values.fee_structure_id,
          p_amount: values.amount,
          p_payment_method: values.payment_method,
          p_transaction_id: values.transaction_id || null
        }
      );
      
      if (error) throw error;
      
      toast({
        title: "Payment Submitted",
        description: "Your payment is being processed and will be reviewed shortly",
      });
      
      navigate("/fees");
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast({
        title: "Error",
        description: "Failed to submit payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-institute-500" />
      </div>
    );
  }
  
  // Show message if there are no fee structures available after trying to add default
  if (feeStructures.length === 0 && !initialLoading) {
    return (
      <>
        <PageHeader 
          title="Make Payment" 
          description="Submit a fee payment"
        >
          <Button variant="outline" onClick={() => navigate("/fees")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fees
          </Button>
        </PageHeader>
        
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center max-w-md">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No Fee Structures Available</h3>
            <p className="mt-2 text-gray-600">
              There are no applicable fee structures found for your enrollments. 
              Please contact the administration for assistance.
            </p>
            <Button className="mt-6" onClick={() => navigate("/fees")}>
              Return to Fees Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <PageHeader 
        title="Make Payment" 
        description="Submit a fee payment"
      >
        <Button variant="outline" onClick={() => navigate("/fees")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Fees
        </Button>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white p-6 rounded-md shadow">
                <h3 className="text-lg font-medium mb-4">Payment Details</h3>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fee_structure_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fee Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fee type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {feeStructures.map((fee) => (
                              <SelectItem key={fee.id} value={fee.id}>
                                {fee.fee_type} - {fee.academic_year}
                                {fee.semester ? ` (Semester ${fee.semester})` : ""}
                                {fee.course_name ? ` - ${fee.course_name}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the type of fee you wish to pay
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            {...field}
                            readOnly={!!watchedFeeStructureId}
                          />
                        </FormControl>
                        <FormDescription>
                          Amount is automatically set based on selected fee type
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="credit_card" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Credit Card
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="debit_card" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Debit Card
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="net_banking" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Net Banking
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="upi" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                UPI
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="cash" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Cash
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {watchedPaymentMethod !== 'cash' && (
                    <FormField
                      control={form.control}
                      name="transaction_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter transaction ID or reference number"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the transaction ID or reference number from your payment
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/fees")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CreditCard className="mr-2 h-4 w-4" />
                  Submit Payment
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>Your fee and payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentSummary && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Fees:</span>
                    <span className="font-medium">₹{paymentSummary.total_due.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Already Paid:</span>
                    <span className="font-medium">₹{paymentSummary.total_paid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Balance Due:</span>
                    <span className="font-medium">₹{paymentSummary.pending_amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Selected Fee:</span>
                      <span className="font-medium">
                        {watchedFeeStructureId ? 
                          feeStructures.find(f => f.id === watchedFeeStructureId)?.fee_type || "-" : 
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount to Pay:</span>
                      <span className="font-medium">
                        {form.getValues("amount") ? 
                          `₹${form.getValues("amount").toLocaleString()}` : 
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method:</span>
                      <span className="font-medium capitalize">
                        {watchedPaymentMethod?.replace("_", " ") || "-"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <div className="text-sm text-gray-500 w-full">
                <div className="flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>Payments are subject to verification and approval.</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MakePaymentPage;
