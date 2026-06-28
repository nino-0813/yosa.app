// 5段階の表情セレクタ（数値入力は使わない・感覚で押せる / 設計書 2-2）。

interface FaceProps {
  level: number; // 1..5
  size?: number;
  active?: boolean;
}

/** 口の曲がりで 1（つらい）〜5（整った）を表す顔。 */
export function Face({ level, size = 30, active }: FaceProps) {
  const depth = (level - 3) * 2.4; // 正で笑顔、負でしかめ
  const mouth = `M8.5 ${15 - depth * 0.15} Q12 ${15 + depth} 15.5 ${15 - depth * 0.15}`;
  const eyeY = 10.5;
  const color = active ? "var(--surface)" : "var(--ink-soft)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9.4" cy={eyeY} r="0.95" fill={color} />
      <circle cx="14.6" cy={eyeY} r="0.95" fill={color} />
      <path
        d={mouth}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

interface FaceScaleProps {
  value: number | null;
  onChange: (v: number) => void;
  low: string;
  high: string;
}

export function FaceScale({ value, onChange, low, high }: FaceScaleProps) {
  return (
    <div>
      <div className="facescale">
        {[1, 2, 3, 4, 5].map((lv) => {
          const active = value === lv;
          return (
            <button
              key={lv}
              className={`facebtn${active ? " active" : ""}`}
              aria-label={`${lv} / 5`}
              aria-pressed={active}
              onClick={() => onChange(lv)}
            >
              <Face level={lv} active={active} />
            </button>
          );
        })}
      </div>
      <div className="facescale-poles">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}
