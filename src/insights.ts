// 変化の言語化ロジック（設計書 2-3 / 4）。
// 医療的に断定しない（「治った」は使わない）。でも曖昧に逃げず、
// 観察した事実を前向きに伝える。データ1点（初回）でも必ず何かを返す。

import { METRICS, Metric, MetricKey, Visit, daysBetween, todayIso } from "./data";

export type Trend = "early" | "up" | "stable-good" | "wobble" | "flat";

export interface MetricInsight {
  metric: Metric;
  series: number[]; // 来店順のスコア
  latest: number;
  trend: Trend;
  text: string;
}

function seriesFor(visits: Visit[], key: MetricKey): number[] {
  return visits.map((v) => v.scores[key]);
}

function range(arr: number[]): number {
  return Math.max(...arr) - Math.min(...arr);
}

export function analyzeMetric(visits: Visit[], metric: Metric): MetricInsight {
  const series = seriesFor(visits, metric.key);
  const latest = series[series.length - 1] ?? 0;

  // 初回：推移が出せないので「覚えておいた」と次回理由を作る
  if (series.length <= 1) {
    return {
      metric,
      series,
      latest,
      trend: "early",
      text: `今日の「${metric.label}」を覚えておきました。次に来たとき、変化が見えます。`,
    };
  }

  const first = series[0];
  const prev = series[series.length - 2];
  const diff = latest - first;
  const recent = series.slice(-3);
  const wobbly = range(series) >= 2 && latest <= prev && diff < 2;

  let trend: Trend;
  let text: string;

  if (diff >= 2) {
    trend = "up";
    text = `${metric.label}が初回より${diff}段階、「${metric.high}」に近づきました。`;
  } else if (latest >= 4 && diff <= 1 && range(recent) <= 1) {
    trend = "stable-good";
    text = `${metric.label}は「${metric.high}」が続いています。いいリズムです。`;
  } else if (latest > prev && diff >= 1) {
    trend = "up";
    text = `${metric.label}は前回より、すこし「${metric.high}」のほうへ。`;
  } else if (wobbly) {
    trend = "wobble";
    text = metric.delicate
      ? `${metric.label}はまだ揺れがあります。続けると整いやすい部分です。`
      : `${metric.label}はまだ揺れがあります。続けると安定しやすい部分です。`;
  } else if (diff === 0) {
    trend = "flat";
    text = `${metric.label}は今のところ横ばい。変化はゆっくりで大丈夫です。`;
  } else {
    trend = "up";
    text = `${metric.label}は少しずつ「${metric.high}」のほうへ動いています。`;
  }

  return { metric, series, latest, trend, text };
}

export function analyzeAll(visits: Visit[]): MetricInsight[] {
  return METRICS.map((m) => analyzeMetric(visits, m));
}

/** 変化画面の冒頭の一言（全体の総括）。 */
export function changeHeadline(visits: Visit[]): string {
  if (visits.length <= 1) {
    return "最初の一歩を記録しました。ここから、あなたの変化が積み重なっていきます。";
  }
  const insights = analyzeAll(visits);
  const ups = insights.filter((i) => i.trend === "up" || i.trend === "stable-good");
  if (ups.length >= 3) {
    return "全体に、体が整う方へ向かっています。今日の自分を見てみましょう。";
  }
  if (ups.length >= 1) {
    return `${ups[0].metric.label}を中心に、変化が出はじめています。`;
  }
  return "今日の状態を記録しました。続けるほど、変化は見えやすくなります。";
}

/** ホームの「今日の一言」（設計書 2-1）。来店回数・直近・間隔で出し分ける。 */
export function homeGreeting(visits: Visit[]): { line: string; nudge?: string } {
  const count = visits.length;

  if (count === 0) {
    return { line: "はじめまして。今日の体を記録するところから始めましょう。" };
  }
  if (count === 1) {
    return {
      line: "最初の記録、おつかれさまでした。次に来たとき、変化が見えはじめます。",
    };
  }

  // もっとも前向きに語れる項目を選ぶ
  const insights = analyzeAll(visits);
  const up = insights
    .filter((i) => i.trend === "up" || i.trend === "stable-good")
    .sort((a, b) => b.latest - a.latest)[0];

  const line = up
    ? `${up.metric.label}が、初めの頃より和らいできています。`
    : "今日も、自分の体に耳をすませてみましょう。";

  // 来店間隔が空いていたら、離脱の手前でそっと背中を押す
  const last = visits[visits.length - 1].date;
  const gap = daysBetween(last, todayIso());
  let nudge: string | undefined;
  if (gap >= 21) {
    nudge = `前回から${Math.floor(gap / 7)}週間。冷えが戻りやすい頃です。そろそろ整えにきませんか。`;
  } else if (gap >= 14) {
    nudge = `前回から${gap}日。そろそろ整えにくる頃合いです。`;
  }

  return { line, nudge };
}

/** 記録直後のひと言（設計書 2-2）。 */
export function recordEcho(visitCount: number): string {
  return `記録しました。来店${visitCount}回目です。`;
}
