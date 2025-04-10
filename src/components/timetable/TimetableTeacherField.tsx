
import {
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
import { TeacherView } from "@/types";
import { UseFormReturn } from "react-hook-form";
import { TimetableFormValues } from "./TimetableFormConstants";

interface TimetableTeacherFieldProps {
  form: UseFormReturn<TimetableFormValues>;
  teachers: TeacherView[];
}

const TimetableTeacherField = ({
  form,
  teachers,
}: TimetableTeacherFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="teacher_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Teacher</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Teacher for this timetable entry
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TimetableTeacherField;
