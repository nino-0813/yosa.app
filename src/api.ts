// Supabase とのやりとり（来店記録の保存・取得）。
//
// 本番は Edge Function「onu-api」経由（LIFFトークンを検証して本人だけが操作）。
// Edge未デプロイ時は従来どおり直接DB（anon）にフォールバックするので、移行中も壊れない。
// → Edgeデプロイ＋動作確認後に supabase/rls-harden.sql を流すと、直接DBは遮断され
//    Edge経由（service_role）だけになる。
import { supabase } from "./supabase";
import { getIdToken } from "./liff";
import { Scores, SEED_VISITS, Visit, todayIso } from "./data";

interface VisitRow {
  visited_on: string;
  cold: number;
  swelling: number;
  sleep: number;
  bowel: number;
  mood: number;
}

function rowToVisit(r: VisitRow): Visit {
  return {
    date: r.visited_on,
    scores: {
      cold: r.cold,
      swelling: r.swelling,
      sleep: r.sleep,
      bowel: r.bowel,
      mood: r.mood,
    },
  };
}

/** Edge Function 呼び出し。常に最新の visits を返す。 */
async function edge(action: string, payload: Record<string, unknown> = {}): Promise<Visit[]> {
  const { data, error } = await supabase.functions.invoke("onu-api", {
    body: { action, idToken: getIdToken(), ...payload },
  });
  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));
  return (data?.visits ?? []) as Visit[];
}

// ---- 直接DB（フォールバック / Edge未デプロイ時のみ実際に使われる） ----

async function fetchVisitsDirect(lineUserId: string): Promise<Visit[]> {
  const { data, error } = await supabase
    .from("onu_visits")
    .select("visited_on, cold, swelling, sleep, bowel, mood")
    .eq("line_user_id", lineUserId)
    .order("visited_on", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToVisit);
}

async function ensureCustomerDirect(lineUserId: string, displayName?: string | null) {
  const { error } = await supabase
    .from("onu_customers")
    .upsert(
      { line_user_id: lineUserId, display_name: displayName ?? null },
      { onConflict: "line_user_id" },
    );
  if (error) throw error;
}

async function saveTodayVisitDirect(lineUserId: string, displayName: string | null, scores: Scores) {
  await ensureCustomerDirect(lineUserId, displayName);
  const { error } = await supabase.from("onu_visits").upsert(
    { line_user_id: lineUserId, visited_on: todayIso(), ...scores },
    { onConflict: "line_user_id,visited_on" },
  );
  if (error) throw error;
}

async function resetVisitsDirect(lineUserId: string, displayName: string | null, mode: "first" | "seed") {
  await ensureCustomerDirect(lineUserId, displayName);
  const { error: delErr } = await supabase.from("onu_visits").delete().eq("line_user_id", lineUserId);
  if (delErr) throw delErr;
  if (mode === "seed") {
    const today = new Date();
    const offsets = [52, 38, 22, 9];
    const rows = SEED_VISITS.map((v, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offsets[i]);
      return { line_user_id: lineUserId, visited_on: d.toISOString().slice(0, 10), ...v.scores };
    });
    const { error: insErr } = await supabase.from("onu_visits").insert(rows);
    if (insErr) throw insErr;
  }
}

// ---- 公開API（Edge優先・失敗時は直接DB） ----

/** このユーザーの来店記録を、来店順（古い→新しい）で取得 */
export async function fetchVisits(lineUserId: string): Promise<Visit[]> {
  try {
    return await edge("fetch");
  } catch {
    return fetchVisitsDirect(lineUserId);
  }
}

/** 今日の来店として記録（同日は上書き）。QR=来店確定の想定で1日1回。 */
export async function saveTodayVisit(
  lineUserId: string,
  displayName: string | null,
  scores: Scores,
): Promise<void> {
  try {
    await edge("save", { scores });
  } catch {
    await saveTodayVisitDirect(lineUserId, displayName, scores);
  }
}

/** プロト確認用：このユーザーの記録を初期状態へ。 */
export async function resetVisits(
  lineUserId: string,
  displayName: string | null,
  mode: "first" | "seed",
): Promise<void> {
  try {
    await edge("reset", { mode });
  } catch {
    await resetVisitsDirect(lineUserId, displayName, mode);
  }
}
