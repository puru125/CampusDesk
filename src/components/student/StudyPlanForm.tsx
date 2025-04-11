
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Define the color options for study plans
const colorOptions = [
  { value: "#4CAF50", label: "Green", class: "bg-green-500" },
  { value: "#2196F3", label: "Blue", class: "bg-blue-500" },
  { value: "#FFC107", label: "Yellow", class: "bg-yellow-500" },
  { value: "#F44336", label: "Red", class: "bg-red-500" },
  { value: "#9C27B0", label: "Purple", class: "bg-purple-500" },
];

// Time options for the select dropdown
const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return {
    value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
  };
});

// Validation schema for the form
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string({
    required_error: "Please select a start time",
  }),
  endTime: z.string({
    required_error: "Please select an end time",
  }),
  color: z.string().default("#4CAF50"),
});

type FormValues = z.infer<typeof formSchema>;

interface StudyPlanFormProps {
  studentId: string;
  initialData?: {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    color?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const StudyPlanForm = ({ 
  studentId, 
  initialData, 
  onSuccess, 
  onCancel 
}: StudyPlanFormProps) => {
  const { toast } = useToast();
  const isEditing = !!initialData;

  // Parse initial values if editing
  const getInitialValues = () => {
    if (!initialData) {
      return {
        title: "",
        description: "",
        date: new Date(),
        startTime: "09:00",
        endTime: "10:00",
        color: "#4CAF50",
      };
    }

    const startDate = new Date(initialData.start_time);
    const startTime = format(startDate, "HH:mm");
    
    const endDate = new Date(initialData.end_time);
    const endTime = format(endDate, "HH:mm");

    return {
      title: initialData.title,
      description: initialData.description || "",
      date: startDate,
      startTime,
      endTime,
      color: initialData.color || "#4CAF50",
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Convert form values to database format
      const startDateTime = new Date(values.date);
      const [startHours, startMinutes] = values.startTime.split(":").map(Number);
      startDateTime.setHours(startHours, startMinutes);

      const endDateTime = new Date(values.date);
      const [endHours, endMinutes] = values.endTime.split(":").map(Number);
      endDateTime.setHours(endHours, endMinutes);

      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        toast({
          title: "Invalid Time Range",
          description: "End time must be after start time",
          variant: "destructive",
        });
        return;
      }

      const planData = {
        student_id: studentId,
        title: values.title,
        description: values.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        color: values.color,
      };

      let response;
      if (isEditing) {
        response = await extendedSupabase
          .from("student_study_plans")
          .update(planData)
          .eq("id", initialData.id);
      } else {
        response = await extendedSupabase
          .from("student_study_plans")
          .insert(planData);
      }

      if (response.error) {
        throw response.error;
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving study plan:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} study plan`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Math Revision" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What will you study?" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((option) => (
                      <div 
                        key={option.value}
                        className={cn(
                          "w-8 h-8 rounded-full cursor-pointer border-2 hover:opacity-80",
                          option.class,
                          field.value === option.value ? "border-black" : "border-gray-200"
                        )}
                        onClick={() => form.setValue("color", option.value)}
                        title={option.label}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <select
                          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          {...field}
                        >
                          {timeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <Clock className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <select
                          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          {...field}
                        >
                          {timeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <Clock className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Update Plan" : "Save Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StudyPlanForm;
