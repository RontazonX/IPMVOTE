import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qzunwwnjjihyuklmguaz.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_wJsqXVH3U6h2d7EYphTS3w_ittSIVrZ";
  
  return createBrowserClient(supabaseUrl, supabaseKey)
}
