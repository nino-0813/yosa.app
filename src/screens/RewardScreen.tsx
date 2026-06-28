import { Visit, FREE_EVERY, formatDateJP } from "../data";
import { RewardGauge } from "../components/RewardGauge";
import { SteamMark, CheckIcon } from "../components/icons";

export function RewardScreen({ visits }: { visits: Visit[] }) {
  const count = visits.length;
  const cyclePos = count % FREE_EVERY;
  const freeReady = count > 0 && cyclePos === 0;
  const remaining = freeReady ? 0 : FREE_EVERY - cyclePos;

  return (
    <div>
      <span className="kicker">特典</span>
      <h1 className="page-title">5回の来店で、1回無料</h1>

      <section className="card">
        <RewardGauge count={count} />
        <p className="reward-text center">
          {freeReady ? (
            <strong>無料の1回が使えます</strong>
          ) : (
            <>
              あと<strong> {remaining} </strong>回
            </>
          )}
        </p>
      </section>

      {freeReady && (
        <section className="card coupon">
          <div className="coupon-top">
            <SteamMark size={28} />
            <span>無料クーポン</span>
          </div>
          <p className="coupon-body">よもぎ蒸し 1回 無料</p>
          <p className="muted center">
            会計のときに、この画面を店員にお見せください。
          </p>
          <button className="btn btn-accent coupon-btn">この画面を見せる</button>
        </section>
      )}

      <section className="card">
        <div className="section-title">これまでの来店</div>
        {count === 0 ? (
          <p className="muted">まだ来店の記録がありません。</p>
        ) : (
          <ul className="visit-log">
            {visits
              .slice()
              .reverse()
              .map((v, i) => {
                const n = count - i;
                const free = n % FREE_EVERY === 0;
                return (
                  <li key={v.date} className="visit-row">
                    <span className="visit-check">
                      <CheckIcon size={15} />
                    </span>
                    <span className="visit-n">{n}回目</span>
                    <span className="visit-date muted">{formatDateJP(v.date)}</span>
                    {free && <span className="pill visit-free">無料達成</span>}
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </div>
  );
}
