export const environment = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  SUPABASE_PROJECT_URL: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
};
