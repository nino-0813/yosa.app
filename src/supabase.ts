import { createClient } from "@supabase/supabase-js";

// publishable(anon)キーはフロントに出る前提の公開鍵なので直書きで問題ない。
// （秘密の service_role キーは絶対にここへ書かない）
// herb と統一した本番DB「yosahp」。publishable(公開)キーなので直書きOK。
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  "https://qhmycdolcvuqkvncskdy.supabase.co";
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "sb_publishable_y1nig6wP5-oEoGfk5RouIg_HHh6Pp0q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
