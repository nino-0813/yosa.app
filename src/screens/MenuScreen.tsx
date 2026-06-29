import { useState } from "react";
import { ChevronRight } from "../components/icons";

interface Props {
  onReset: (mode: "first" | "seed") => void;
}

function Row({ label, sub, onClick }: { label: string; sub?: string; onClick?: () => void }) {
  return (
    <button className="menu-row" onClick={onClick}>
      <span>
        <span className="menu-row-label">{label}</span>
        {sub && <span className="menu-row-sub">{sub}</span>}
      </span>
      <ChevronRight size={18} />
    </button>
  );
}

export function MenuScreen({ onReset }: Props) {
  const [notify, setNotify] = useState(true);
  const [cycleLayer, setCycleLayer] = useState(false);

  return (
    <div>
      <span className="kicker">メニュー</span>
      <h1 className="page-title">ON:U｜韓国よもぎ蒸し</h1>

      <section className="card menu-group">
        <Row label="次回の予約をする" sub="店の予約ページへ" />
        <div className="divider" />
        <Row label="LINEで相談・予約" sub="トークを開く" />
      </section>

      <section className="card menu-group">
        <Row label="店の情報" sub="住所・営業時間・アクセス" />
        <div className="divider" />
        <div className="menu-toggle">
          <span>
            <span className="menu-row-label">お知らせ通知</span>
            <span className="menu-row-sub">来店の頃合いをそっとお伝えします</span>
          </span>
          <Switch on={notify} onChange={setNotify} />
        </div>
        <div className="divider" />
        <div className="menu-toggle">
          <span>
            <span className="menu-row-label">生理周期に合わせる</span>
            <span className="menu-row-sub">希望する方だけ（あとから追加予定）</span>
          </span>
          <Switch on={cycleLayer} onChange={setCycleLayer} />
        </div>
      </section>

      <section className="card menu-group demo">
        <div className="section-title">プロトタイプ確認用</div>
        <p className="muted demo-note">
          画面の出し分けを試すための切り替えです（本番にはありません）。
        </p>
        <div className="demo-btns">
          <button className="btn btn-ghost" onClick={() => onReset("first")}>
            初回の状態で見る
          </button>
          <button className="btn btn-ghost" onClick={() => onReset("seed")}>
            4回来店の状態に戻す
          </button>
        </div>
      </section>

      <p className="menu-foot muted">ON:U · Korean Herbal Steam · v0.1</p>
    </div>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`switch${on ? " on" : ""}`}
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
    >
      <span className="switch-knob" />
    </button>
  );
}
