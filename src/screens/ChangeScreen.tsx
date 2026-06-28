import { MetricKey, Visit, formatDateJP } from "../data";
import { analyzeAll, changeHeadline, Trend } from "../insights";
import { LineChart } from "../components/LineChart";
import { SteamMark } from "../components/icons";
import type { Tab } from "../App";

interface Props {
  visits: Visit[];
  go: (t: Tab) => void;
}

// 温（冷え・気分）はclay、体（むくみ・睡眠・お通じ）はmoss。落ち着いた2系統。
const WARM: MetricKey[] = ["cold", "mood"];

const TREND_LABEL: Record<Trend, string> = {
  early: "はじまり",
  up: "上向き",
  "stable-good": "good",
  wobble: "ゆらぎ",
  flat: "横ばい",
};

export function ChangeScreen({ visits, go }: Props) {
  if (visits.length === 0) {
    return (
      <div>
        <span className="kicker">変化</span>
        <h1 className="page-title">まだ記録がありません</h1>
        <section className="card empty">
          <SteamMark size={40} className="empty-steam" />
          <p>今日の体調を記録すると、ここに変化が積み重なっていきます。</p>
          <button className="btn btn-accent" onClick={() => go("record")}>
            今日の体調を記録する
          </button>
        </section>
      </div>
    );
  }

  const insights = analyzeAll(visits);
  const headline = changeHeadline(visits);
  const first = formatDateJP(visits[0].date);
  const last = formatDateJP(visits[visits.length - 1].date);

  return (
    <div>
      <span className="kicker">あなたの変化</span>
      <h1 className="page-title">{headline}</h1>
      <p className="muted change-range">
        {first} 〜 {last} ・ {visits.length}回の来店
      </p>

      <div className="change-list">
        {insights.map((ins) => {
          const warm = WARM.includes(ins.metric.key);
          const color = warm ? "var(--clay)" : "var(--moss)";
          const fill = warm ? "var(--clay-soft)" : "var(--moss-soft)";
          return (
            <section className="card change-item" key={ins.metric.key}>
              <div className="change-item-head">
                <span className="change-label">{ins.metric.label}</span>
                <span className={`trend trend-${ins.trend}`}>
                  {TREND_LABEL[ins.trend]}
                </span>
              </div>
              <LineChart series={ins.series} color={color} fill={fill} />
              <p className="change-text">{ins.text}</p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
