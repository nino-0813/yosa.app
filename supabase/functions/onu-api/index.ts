// ON:U セキュアAPI（Supabase Edge Function / Deno）
// LIFFのIDトークンをLINEに検証させ、「本人」だけが自分の来店記録を読み書きできるようにする。
// service_role を使うのでRLSを迂回できる（このキーはサーバー側＝この関数内だけ）。
//
// デプロイ時の設定:
//   - Verify JWT を「無効」にする（Supabaseの認証ではなくLINEトークンを使うため）
//   - シークレット LINE_CHANNEL_ID にON:U MINIアプリの「チャネルID」を設定
//   - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY は自動で入る
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LINE_CHANNEL_ID = Deno.env.get("LINE_CHANNEL_ID") ?? "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

type Scores = { cold: number; swelling: number; sleep: number; bowel: number; mood: number };

// IDトークンをLINEに検証させ、本人のuserId・表示名を得る。トークン無し＝demo（ブラウザ確認用）。
async function resolveUser(idToken?: string): Promise<{ id: string; name: string | null }> {
  if (!idToken) return { id: "demo", name: "ゲスト" };
  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken, client_id: LINE_CHANNEL_ID }),
  });
  if (!res.ok) throw new Error("LINE token verify failed");
  const p = await res.json();
  return { id: p.sub as string, name: (p.name as string) ?? null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, idToken, scores, mode } = await req.json();
    const user = await resolveUser(idToken);
    const db = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const ensureCustomer = async () => {
      await db.from("onu_customers").upsert(
        { line_user_id: user.id, display_name: user.name, last_login_at: new Date().toISOString() },
        { onConflict: "line_user_id" },
      );
    };
    const getVisits = async () => {
      const { data, error } = await db
        .from("onu_visits")
        .select("visited_on, cold, swelling, sleep, bowel, mood")
        .eq("line_user_id", user.id)
        .order("visited_on", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r: Record<string, number | string>) => ({
        date: r.visited_on,
        scores: {
          cold: r.cold,
          swelling: r.swelling,
          sleep: r.sleep,
          bowel: r.bowel,
          mood: r.mood,
        },
      }));
    };

    if (action === "fetch") {
      return json({ visits: await getVisits() });
    }

    if (action === "save") {
      await ensureCustomer();
      const s = scores as Scores;
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await db
        .from("onu_visits")
        .upsert({ line_user_id: user.id, visited_on: today, ...s }, { onConflict: "line_user_id,visited_on" });
      if (error) throw error;
      return json({ visits: await getVisits() });
    }

    if (action === "reset") {
      await ensureCustomer();
      await db.from("onu_visits").delete().eq("line_user_id", user.id);
      if (mode === "seed") {
        const seed: number[][] = [
          [52, 1, 2, 2, 2, 2],
          [38, 2, 2, 3, 3, 3],
          [22, 3, 3, 3, 2, 3],
          [9, 3, 4, 4, 3, 4],
        ];
        const rows = seed.map(([off, cold, swelling, sleep, bowel, mood]) => {
          const d = new Date();
          d.setDate(d.getDate() - off);
          return { line_user_id: user.id, visited_on: d.toISOString().slice(0, 10), cold, swelling, sleep, bowel, mood };
        });
        const { error } = await db.from("onu_visits").insert(rows);
        if (error) throw error;
      }
      return json({ visits: await getVisits() });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
