// Supabase とのやりとり（来店記録の保存・取得）。
import { supabase } from "./supabase";
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

/** このユーザーの来店記録を、来店順（古い→新しい）で取得 */
export async function fetchVisits(lineUserId: string): Promise<Visit[]> {
  const { data, error } = await supabase
    .from("visits")
    .select("visited_on, cold, swelling, sleep, bowel, mood")
    .eq("line_user_id", lineUserId)
    .order("visited_on", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToVisit);
}

/** 顧客行を用意（なければ作る・名前は更新） */
async function ensureCustomer(lineUserId: string, displayName?: string | null) {
  const { error } = await supabase
    .from("customers")
    .upsert(
      { line_user_id: lineUserId, display_name: displayName ?? null },
      { onConflict: "line_user_id" },
    );
  if (error) throw error;
}

/** 今日の来店として記録（同日は上書き）。QR=来店確定の想定で1日1回。 */
export async function saveTodayVisit(
  lineUserId: string,
  displayName: string | null,
  scores: Scores,
): Promise<void> {
  await ensureCustomer(lineUserId, displayName);
  const { error } = await supabase.from("visits").upsert(
    {
      line_user_id: lineUserId,
      visited_on: todayIso(),
      ...scores,
    },
    { onConflict: "line_user_id,visited_on" },
  );
  if (error) throw error;
}

/** プロト確認用：このユーザーの記録を初期状態へ。 */
export async function resetVisits(
  lineUserId: string,
  displayName: string | null,
  mode: "first" | "seed",
): Promise<void> {
  await ensureCustomer(lineUserId, displayName);
  const { error: delErr } = await supabase
    .from("visits")
    .delete()
    .eq("line_user_id", lineUserId);
  if (delErr) throw delErr;

  if (mode === "seed") {
    const today = new Date();
    const offsets = [52, 38, 22, 9];
    const rows = SEED_VISITS.map((v, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offsets[i]);
      return {
        line_user_id: lineUserId,
        visited_on: d.toISOString().slice(0, 10),
        ...v.scores,
      };
    });
    const { error: insErr } = await supabase.from("visits").insert(rows);
    if (insErr) throw insErr;
  }
}
