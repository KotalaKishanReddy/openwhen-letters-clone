import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env } from '../env'

/** Service-role client — ONLY for server-side API routes. Never expose to client. */
export function createServiceClient() {
  return createSupabaseClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession:   false,
      },
    }
  )
}
