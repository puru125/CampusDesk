
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xqcbioazfxgbkdcetkrh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxY2Jpb2F6ZnhnYmtkY2V0a3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTIwODQsImV4cCI6MjA1OTc4ODA4NH0.qADaw0O4jNLLrbC1OClsfu529IhpTShWo98AAoawqD4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Helper function to handle type conversion from Supabase to our application types
export function mapSupabaseData<T>(data: any): T {
  // This function helps map data from Supabase to our application types
  // Cast is done after type checking in components
  return data as T;
}
