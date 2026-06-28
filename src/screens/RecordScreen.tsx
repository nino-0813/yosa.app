import { useState } from "react";
import { Metric, MetricKey, Scores } from "../data";
import { FaceScale } from "../components/FaceScale";

interface Props {
  metrics: Metric[];
  visitNumber: number;
  onSave: (scores: Scores) => void;
}

export function RecordScreen({ metrics, visitNumber, onSave }: Props) {
  const [draft, setDraft] = useState<Partial<Record<MetricKey, number>>>({});

  const allDone = metrics.every((m) => draft[m.key] != null);

  function set(key: MetricKey, v: number) {
    setDraft((d) => ({ ...d, [key]: v }));
  }

  function handleSave() {
    if (!allDone) return;
    onSave(draft as Scores);
  }

  return (
    <div>
      <span className="kicker">店頭QRから来店しました</span>
      <h1 className="page-title">今日の体調を、3タップで</h1>

      <p className="record-note pill">来店 {visitNumber} 回目 · 約10秒</p>

      <div className="record-list">
        {metrics.map((m) => (
          <section className="card record-item" key={m.key}>
            <div className="record-item-head">
              <span className="record-label">{m.label}</span>
              {m.delicate && <span className="record-quiet">そっと記録</span>}
            </div>
            <FaceScale
              value={draft[m.key] ?? null}
              onChange={(v) => set(m.key, v)}
              low={m.low}
              high={m.high}
            />
          </section>
        ))}
      </div>

      <div className="record-cta">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!allDone}
          aria-disabled={!allDone}
        >
          {allDone ? "記録する" : "5つを選んでください"}
        </button>
      </div>
    </div>
  );
}
