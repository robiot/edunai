import { createClient } from "@supabase/supabase-js";

import { environment } from "./environment";

export const supabase = createClient(
  environment.SUPABASE_PROJECT_URL!,
  environment.SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
