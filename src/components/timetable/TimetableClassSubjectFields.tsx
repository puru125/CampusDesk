
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
import { Class, Subject } from "@/types";
import { UseFormReturn } from "react-hook-form";
import { TimetableFormValues } from "./TimetableFormConstants";

interface TimetableClassSubjectFieldsProps {
  form: UseFormReturn<TimetableFormValues>;
  classes: Class[];
  subjects: Subject[];
}

const TimetableClassSubjectFields = ({
  form,
  classes,
  subjects,
}: TimetableClassSubjectFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="class_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Class</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Class for this timetable entry
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="subject_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} {subject.course && `(${subject.course.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Subject for this timetable entry
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default TimetableClassSubjectFields;
