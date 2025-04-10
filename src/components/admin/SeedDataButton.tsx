
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { seedIndianDummyData } from "@/utils/seedIndianData";
import { useToast } from "@/hooks/use-toast";
import { Database, Loader2 } from "lucide-react";

const SeedDataButton = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const result = await seedIndianDummyData();
      
      if (result?.success) {
        toast({
          title: "Success",
          description: "Dummy data has been successfully inserted",
          variant: "default",
        });
      } else {
        throw new Error("Failed to seed data");
      }
    } catch (error) {
      console.error("Error seeding data:", error);
      toast({
        title: "Error",
        description: "Failed to seed data. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedData} 
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {loading ? "Seeding Data..." : "Seed Indian Dummy Data"}
    </Button>
  );
};

export default SeedDataButton;
