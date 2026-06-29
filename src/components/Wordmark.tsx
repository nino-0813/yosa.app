// ON:U ワードマーク。コロンだけゴールドにして韓国コスメ的な品を出す。

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`wordmark${className ? ` ${className}` : ""}`} aria-label="ON:U">
      ON<span className="colon">:</span>U
    </span>
  );
}

/** ロゴ＋英文サブ＋金の罫。ホーム上部などの見出しに。 */
export function BrandBlock({ tagline }: { tagline?: string }) {
  return (
    <div className="brand-block">
      <Wordmark />
      <div className="brand-sub">Korean Herbal Steam</div>
      <div className="brand-rule" />
      {tagline && <p className="brand-tagline">{tagline}</p>}
    </div>
  );
}
