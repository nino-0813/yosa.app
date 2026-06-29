// LIFF（LINE Front-end Framework）連携。
// VITE_LIFF_ID が設定されていれば LINE 内で初期化し、プロフィールを取得する。
// 未設定 or LINE 外（普通のブラウザ）でも、UIはそのまま動く（プロト確認用）。

import { useEffect, useState } from "react";
import liff from "@line/liff";

/** LINEのIDトークン（Edge関数で本人検証に使う）。未ログイン/ブラウザでは null。 */
export function getIdToken(): string | null {
  try {
    return liff.getIDToken();
  } catch {
    return null;
  }
}

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export interface LiffState {
  ready: boolean; // 初期化が終わったか
  inClient: boolean; // LINEアプリの中で開かれているか
  profile: LiffProfile | null;
  error: string | null;
}

// LINE MINIアプリの LIFF ID。環境変数があればそれを優先、無ければ開発用をデフォルトに。
// （LIFF IDは公開情報。本番公開時は本番用ID 2010536896-dL4kgzyR に差し替える）
const DEV_LIFF_ID = "2010536894-uhTekGBz";
const LIFF_ID =
  (import.meta.env.VITE_LIFF_ID as string | undefined) || DEV_LIFF_ID;

export function useLiff(): LiffState {
  const [state, setState] = useState<LiffState>({
    ready: false,
    inClient: false,
    profile: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    // LIFF IDが無ければLINE連携はスキップ（ブラウザでそのまま表示）
    if (!LIFF_ID) {
      setState({ ready: true, inClient: false, profile: null, error: null });
      return;
    }

    (async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        const inClient = liff.isInClient();

        // LINEアプリの中で未ログインのときだけログインへ（普通のブラウザでは
        // 強制ログインさせず、そのままプロト表示する）。
        if (inClient && !liff.isLoggedIn()) {
          liff.login();
          return;
        }

        let profile: LiffProfile | null = null;
        if (liff.isLoggedIn()) {
          try {
            const p = await liff.getProfile();
            profile = {
              userId: p.userId,
              displayName: p.displayName,
              pictureUrl: p.pictureUrl,
            };
          } catch {
            // プロフィール取得に失敗してもUIは出す
          }
        }

        if (!cancelled) {
          setState({ ready: true, inClient, profile, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            ready: true,
            inClient: false,
            profile: null,
            error: e instanceof Error ? e.message : "LIFF init failed",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
