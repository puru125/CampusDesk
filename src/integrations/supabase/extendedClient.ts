
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
