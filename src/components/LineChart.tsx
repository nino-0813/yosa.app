// 静かな折れ線グラフ（設計書 2-3）。来店回数を横軸に、スコア1〜5を縦軸に。
// 派手にせず、低コントラストのグリッド・やわらかい面・最新の点だけを強調する。

interface LineChartProps {
  series: number[]; // スコア 1..5（来店順）
  color?: string; // 線の色（CSS変数可）
  fill?: string; // 面の色
  height?: number;
}

const W = 300;
const PAD_X = 14;
const PAD_TOP = 12;

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0].x} ${pts[0].y}`;
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
    const t = 0.16;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

export function LineChart({
  series,
  color = "var(--moss)",
  fill = "var(--moss-soft)",
  height = 116,
}: LineChartProps) {
  const H = height;
  const plotH = H - PAD_TOP - 18;
  const n = series.length;

  const x = (i: number) =>
    n <= 1 ? W / 2 : PAD_X + (i * (W - PAD_X * 2)) / (n - 1);
  const y = (s: number) => PAD_TOP + plotH - ((s - 1) / 4) * plotH;

  const pts = series.map((s, i) => ({ x: x(i), y: y(s) }));
  const line = smoothPath(pts);
  const area =
    pts.length > 1
      ? `${line} L${pts[pts.length - 1].x} ${PAD_TOP + plotH} L${pts[0].x} ${PAD_TOP + plotH} Z`
      : "";
  const gid = `g-${color.replace(/[^a-z]/gi, "")}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      role="img"
      aria-label={`推移グラフ（${n}回分）`}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.34" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 低コントラストのグリッド */}
      {[1, 2, 3, 4, 5].map((s) => (
        <line
          key={s}
          x1={PAD_X}
          x2={W - PAD_X}
          y1={y(s)}
          y2={y(s)}
          stroke="var(--line)"
          strokeWidth={s === 3 ? 1 : 0.7}
          strokeDasharray={s === 3 ? "0" : "2 4"}
          opacity={s === 3 ? 0.9 : 0.6}
        />
      ))}

      {area && <path d={area} fill={`url(#${gid})`} />}
      {line && (
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* 過去の点（控えめ） */}
      {pts.slice(0, -1).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.6" fill={color} opacity="0.45" />
      ))}

      {/* 最新の点だけ強調 */}
      {pts.length > 0 && (
        <g>
          <circle
            cx={pts[pts.length - 1].x}
            cy={pts[pts.length - 1].y}
            r="6.5"
            fill={color}
            opacity="0.16"
          />
          <circle
            cx={pts[pts.length - 1].x}
            cy={pts[pts.length - 1].y}
            r="3.6"
            fill={color}
            stroke="var(--surface)"
            strokeWidth="1.5"
          />
        </g>
      )}
    </svg>
  );
}
