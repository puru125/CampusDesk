
import { supabase } from "./client";
import { ExtendedDatabase } from "@/types/supabase-extensions";

// Cast the original client to use our extended types
export const extendedSupabase = supabase as unknown as ReturnType<
  typeof import("@supabase/supabase-js").createClient<ExtendedDatabase>
>;

// This is a workaround for TypeScript until we can properly extend the Supabase types
// The student_timetable_view should be defined in the supabase-extensions.ts file
