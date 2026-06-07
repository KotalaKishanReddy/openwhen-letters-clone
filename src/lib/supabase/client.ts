import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/** Anon client — safe to use in browser. Only has RLS-filtered access. */
export function createBrowserClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
