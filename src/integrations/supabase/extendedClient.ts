
import { supabase } from "./client";
import { ExtendedDatabase, ExtendedSupabaseClient } from "@/types/supabase-extensions";

// Cast the original client to use our extended types
export const extendedSupabase = supabase as unknown as ExtendedSupabaseClient;

// This is a workaround for TypeScript until we can properly extend the Supabase types
// The student_timetable_view should be defined in the supabase-extensions.ts file

