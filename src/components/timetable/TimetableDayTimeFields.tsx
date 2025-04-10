
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
import { UseFormReturn } from "react-hook-form";
import { DAYS_OF_WEEK, TIME_SLOTS, TimetableFormValues } from "./TimetableFormConstants";

interface TimetableDayTimeFieldsProps {
  form: UseFormReturn<TimetableFormValues>;
}

const TimetableDayTimeFields = ({
  form,
}: TimetableDayTimeFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="day_of_week"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Day of Week</FormLabel>
            <Select
              onValueChange={(value) => {
                const parsedValue = parseInt(value, 10);
                field.onChange(isNaN(parsedValue) ? undefined : parsedValue);
              }}
              defaultValue={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Day of the week for this timetable entry
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="start_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Start Time</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              When the class starts
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="end_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>End Time</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              When the class ends
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default TimetableDayTimeFields;
