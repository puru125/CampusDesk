
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Class, Subject, TeacherView } from "@/types";
import { timetableSchema, TimetableFormValues } from "./TimetableFormConstants";
import TimetableClassSubjectFields from "./TimetableClassSubjectFields";
import TimetableTeacherField from "./TimetableTeacherField";
import TimetableDayTimeFields from "./TimetableDayTimeFields";
import { useTimetableEntryMutation } from "./useTimetableEntryMutation";

interface TimetableEntryFormProps {
  classes?: Class[];
  subjects?: Subject[];
  teachers?: TeacherView[];
  onCancel: () => void;
  onSuccess: () => void;
}

export const TimetableEntryForm = ({
  classes = [],
  subjects = [],
  teachers = [],
  onCancel,
  onSuccess,
}: TimetableEntryFormProps) => {
  const { addTimetableEntryMutation, isSubmitting, setIsSubmitting } = 
    useTimetableEntryMutation(onSuccess);

  const form = useForm<TimetableFormValues>({
    resolver: zodResolver(timetableSchema),
    defaultValues: {
      class_id: "",
      subject_id: "",
      teacher_id: "",
      day_of_week: 1,
      start_time: "",
      end_time: "",
    },
  });

  const onSubmit = (values: TimetableFormValues) => {
    setIsSubmitting(true);
    addTimetableEntryMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimetableClassSubjectFields 
            form={form} 
            classes={classes} 
            subjects={subjects} 
          />
          
          <TimetableTeacherField 
            form={form} 
            teachers={teachers} 
          />
          
          <TimetableDayTimeFields 
            form={form} 
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Adding..." : "Add Timetable Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
