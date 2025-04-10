
import { supabase } from "./client";
import { ExtendedDatabase, ExtendedSupabaseClient } from "@/types/supabase-extensions";

// Cast the original client to use our extended types
export const extendedSupabase = supabase as unknown as ExtendedSupabaseClient;

// This client can be used to access tables defined in supabase-extensions.ts
// For example: extendedSupabase.from('teacher_messages')
