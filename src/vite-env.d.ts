/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** LINE Developers で発行する LIFF ID（例: 1234567890-abcdEFGH）。未設定でもブラウザでは動く。 */
  readonly VITE_LIFF_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
