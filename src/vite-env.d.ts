/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** LINE Developers で発行する LIFF ID（例: 1234567890-abcdEFGH）。未設定でもブラウザでは動く。 */
  readonly VITE_LIFF_ID?: string;
  /** Supabase プロジェクトURL（未設定時はコードの既定値を使用）。 */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase publishable(anon) キー（公開鍵。未設定時はコードの既定値を使用）。 */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
