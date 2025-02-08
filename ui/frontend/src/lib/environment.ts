// Environment variables for the application
// In Next.js, we can access environment variables directly from process.env
export const environment = {
  OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? '',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const;
