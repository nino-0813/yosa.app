// 体調記録のメイン5項目。スコアは 1（つらい側）〜 5（整った側）。
// 数値は客には見せず、表情/位置で扱う（設計書 2-2）。

export type MetricKey = "cold" | "swelling" | "sleep" | "bowel" | "mood";

export interface Metric {
  key: MetricKey;
  label: string; // 客に見せる名前
  low: string; // 1 側（つらい）
  high: string; // 5 側（整った）
  delicate?: boolean; // お通じ：静かに扱う項目
}

export const METRICS: Metric[] = [
  { key: "cold", label: "冷え", low: "冷える", high: "ぽかぽか" },
  { key: "swelling", label: "むくみ", low: "むくむ", high: "すっきり" },
  { key: "sleep", label: "睡眠", low: "眠れない", high: "ぐっすり" },
  { key: "bowel", label: "お通じ", low: "滞る", high: "快調", delicate: true },
  { key: "mood", label: "気分", low: "沈む", high: "晴れ" },
];

export type Scores = Record<MetricKey, number>;

export interface Visit {
  /** 来店日（ISO） */
  date: string;
  scores: Scores;
}

/**
 * デモ用の初期来店データ（4回分）。
 * 全体に右肩上がりだが、お通じだけは「まだ揺れがある」設計にして
 * 変化画面の正直な言語化（前向きな一歩）を見せられるようにしている。
 */
export const SEED_VISITS: Visit[] = [
  {
    date: "2026-05-08",
    scores: { cold: 1, swelling: 2, sleep: 2, bowel: 2, mood: 2 },
  },
  {
    date: "2026-05-22",
    scores: { cold: 2, swelling: 2, sleep: 3, bowel: 3, mood: 3 },
  },
  {
    date: "2026-06-07",
    scores: { cold: 3, swelling: 3, sleep: 3, bowel: 2, mood: 3 },
  },
  {
    date: "2026-06-19",
    scores: { cold: 3, swelling: 4, sleep: 4, bowel: 3, mood: 4 },
  },
];

export const FREE_EVERY = 5; // 5回来店で1回無料

export function formatDateJP(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso.slice(0, 10) + "T00:00:00").getTime();
  const b = new Date(bIso.slice(0, 10) + "T00:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
