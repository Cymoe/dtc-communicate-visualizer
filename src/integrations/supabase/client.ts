// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vbodnckdrvwjoryqchxa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2RuY2tkcnZ3am9yeXFjaHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NjMwMTEsImV4cCI6MjA1MDQzOTAxMX0.Rco1GbkEHpx4_d6ycu_trmV7nVLtaxIKeO7aQtOQ0YY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);