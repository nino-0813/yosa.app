import { Visit, FREE_EVERY, formatDateJP } from "../data";
import { homeGreeting } from "../insights";
import { ChevronRight } from "../components/icons";
import { RewardGauge } from "../components/RewardGauge";
import { BrandBlock } from "../components/Wordmark";
import type { Tab } from "../App";

interface Props {
  visits: Visit[];
  recordedToday: boolean;
  go: (t: Tab) => void;
  userName?: string | null;
}

export function HomeScreen({ visits, recordedToday, go, userName }: Props) {
  const { line, nudge } = homeGreeting(visits);
  const count = visits.length;
  const cyclePos = count % FREE_EVERY;
  const freeReady = count > 0 && cyclePos === 0;
  const remaining = freeReady ? 0 : FREE_EVERY - cyclePos;
  const last = count > 0 ? visits[visits.length - 1].date : null;

  return (
    <div>
      <BrandBlock tagline="あたためる、私を。" />
      {userName && (
        <p className="home-welcome">{userName} さん、おかえりなさい。</p>
      )}

      {/* 今日の一言 — ここが勝負どころ */}
      <section className="card greeting">
        <p className="greeting-line">{line}</p>
        {last && (
          <p className="muted greeting-sub">
            前回の来店：{formatDateJP(last)}
          </p>
        )}
      </section>

      {/* 5回無料までの進捗 */}
      <section className="card">
        <div className="section-title">5回の来店で、1回無料</div>
        <RewardGauge count={count} />
        <p className="reward-text">
          {freeReady ? (
            <strong>無料の1回が使えます。</strong>
          ) : count === 0 ? (
            <>最初の1回から、ゆっくり貯まります。</>
          ) : (
            <>
              あと<strong> {remaining} </strong>回で、1回無料。
            </>
          )}
        </p>
        {nudge && <p className="nudge">{nudge}</p>}
      </section>

      {/* 今日することは1つだけ */}
      <div className="home-cta">
        {recordedToday ? (
          <button className="btn btn-primary" onClick={() => go("change")}>
            自分の変化を見る
            <ChevronRight size={20} />
          </button>
        ) : (
          <button className="btn btn-accent" onClick={() => go("record")}>
            今日の体調を記録する
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
