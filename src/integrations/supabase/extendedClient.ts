
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
