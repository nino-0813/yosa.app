import { FREE_EVERY } from "../data";
import { CheckIcon } from "./icons";

/** スタンプではなく、静かなゲージで「あと何回」を見せる（設計書 2-1）。 */
export function RewardGauge({ count }: { count: number }) {
  const cyclePos = count % FREE_EVERY;
  const filled = count > 0 && cyclePos === 0 ? FREE_EVERY : cyclePos;

  return (
    <div className="gauge">
      {Array.from({ length: FREE_EVERY }).map((_, i) => {
        const done = i < filled;
        const isFree = i === FREE_EVERY - 1;
        return (
          <div
            key={i}
            className={`gauge-step${done ? " done" : ""}${isFree ? " free" : ""}`}
            aria-label={isFree ? "無料" : `${i + 1}回目`}
          >
            {done ? (
              <CheckIcon size={15} />
            ) : isFree ? (
              <span className="gauge-free-label">無料</span>
            ) : (
              <span className="gauge-num">{i + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
