
import { supabase } from "./client";
import { ExtendedDatabase } from "@/types/supabase-extensions";

// Cast the original client to use our extended types
export const extendedSupabase = supabase as unknown as ReturnType<
  typeof import("@supabase/supabase-js").createClient<ExtendedDatabase>
>;

// Helper function to check if a Supabase query returned an error
export const isSupabaseError = (result: any): boolean => {
  return result && result.error && typeof result.error === 'object';
};

// Helper function to ensure we handle errors safely when querying Supabase
export const safeQueryResult = <T>(result: any): { data: T[] | null; error: any } => {
  if (isSupabaseError(result)) {
    return { data: null, error: result.error };
  }
  return result as { data: T[] | null; error: any };
};

// Type guard to ensure safe access to data properties
export function isDataArray<T>(data: unknown): data is T[] {
  return Array.isArray(data);
}

// Helper function to generate mock analytics data for reporting
export const generateReportData = async (teacherId: string, subjectId?: string, timeframe: string = 'semester') => {
  // In a real application, this would query the database for actual statistics
  // For now, we'll return realistic mock data
  return {
    attendance: {
      average: 82,
      highest: 95,
      lowest: 70,
      trend: [85, 80, 90, 70, 75, 85],
      weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    },
    performance: {
      average: 76,
      highest: 98,
      lowest: 45,
      assessments: [
        { name: 'Assignment 1', average: 75, highest: 95, lowest: 45 },
        { name: 'Assignment 2', average: 72, highest: 98, lowest: 40 },
        { name: 'Quiz 1', average: 68, highest: 90, lowest: 35 },
        { name: 'Midterm', average: 70, highest: 95, lowest: 42 },
        { name: 'Assignment 3', average: 78, highest: 100, lowest: 50 },
      ],
    },
    grades: {
      distribution: [
        { name: 'A', value: 15 },
        { name: 'B', value: 25 },
        { name: 'C', value: 30 },
        { name: 'D', value: 20 },
        { name: 'F', value: 10 },
      ],
      average: 75.3,
      median: 'C',
      highestGrade: 98,
      lowestGrade: 35,
    }
  };
};
