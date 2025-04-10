
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeeDashboard from "@/components/fees/FeeDashboard";
import FeeStructureList from "@/components/fees/FeeStructureList";
import PaymentsList from "@/components/fees/PaymentsList";
import PendingApprovals from "@/components/fees/PendingApprovals";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const FeesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  const handleNewFeeStructure = () => {
    navigate("/fees/structure/new");
  };

  const handleNewPayment = () => {
    navigate("/fees/payment/new");
  };
  
  return (
    <>
      <PageHeader 
        title="Fees Management" 
        description="Manage fee structures, payments, and approvals"
      >
        {isAdmin && (
          <Button onClick={handleNewFeeStructure}>
            <Plus className="mr-2 h-4 w-4" />
            New Fee Structure
          </Button>
        )}
        {isStudent && (
          <Button onClick={handleNewPayment}>
            <Plus className="mr-2 h-4 w-4" />
            Make Payment
          </Button>
        )}
      </PageHeader>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          {isAdmin && <TabsTrigger value="fee-structures">Fee Structures</TabsTrigger>}
          <TabsTrigger value="payments">
            {isStudent ? "My Payments" : "Payments"}
          </TabsTrigger>
          {isAdmin && <TabsTrigger value="pending">Pending Approvals</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <FeeDashboard />
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="fee-structures" className="space-y-4">
            <FeeStructureList />
          </TabsContent>
        )}
        
        <TabsContent value="payments" className="space-y-4">
          <PaymentsList isStudent={isStudent} studentId={isStudent ? user?.id : undefined} />
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="pending" className="space-y-4">
            <PendingApprovals />
          </TabsContent>
        )}
      </Tabs>
    </>
  );
};

export default FeesPage;
