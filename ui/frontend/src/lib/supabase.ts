import { createClient } from "@supabase/supabase-js";

import { environment } from "./environment";

// Create and export the Supabase client with our environment variables
export const supabase = createClient(
  environment.SUPABASE_URL,
  environment.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
