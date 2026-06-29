import { createClient } from "@supabase/supabase-js";

// publishable(anon)キーはフロントに出る前提の公開鍵なので直書きで問題ない。
// （秘密の service_role キーは絶対にここへ書かない）
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  "https://fmldbvjlsugaqsqmckpx.supabase.co";
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "sb_publishable_vyI5V4eg31970bUjpCYvWA_vzRpm90_";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
