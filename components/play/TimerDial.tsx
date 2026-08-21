"use client";

/**
 * The sitting, as an instrument reading.
 *
 * This was a photoreal kitchen timer -- chrome bezel, cream face, drop shadow -- which was the
 * loudest object on the entry screen and belonged to no other part of the product. The whole
 * app reads its numbers off ruled, monospace instruments, so this is one too: sixty ticks, the
 * first `minutes` of them lit, and the figure in the middle. No bezel, no gloss, no gradient.
 *
 * Angles run clockwise from twelve o'clock, the convention `SpendDial` also follows.
 */
export function TimerDial({ minutes, size = 168 }: { minutes: number; size?: number }) {
  const lit = Math.max(0, Math.min(60, Math.round(minutes)));

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 168 168"
      role="img"
      aria-label={`${minutes} minutes, one sitting`}
      className="shrink-0 overflow-visible"
    >
      {Array.from({ length: 60 }, (_, i) => {
        const major = i % 5 === 0;
        const on = i < lit;
        // 12 o'clock is -90deg in SVG's coordinate space.
        const angle = ((i / 60) * 360 - 90) * (Math.PI / 180);
        const outer = 80;
        const inner = outer - (major ? 12 : on ? 8 : 5);
        return (
          <line
            key={i}
            x1={84 + Math.cos(angle) * inner}
            y1={84 + Math.sin(angle) * inner}
            x2={84 + Math.cos(angle) * outer}
            y2={84 + Math.sin(angle) * outer}
            stroke={on ? "var(--teal)" : "var(--line-2)"}
            strokeWidth={major ? 1.6 : 1}
            opacity={on ? 1 : 0.55}
          />
        );
      })}

      <text
        x="84"
        y="84"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text)"
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontSize: 40,
          letterSpacing: "-0.03em",
        }}
      >
        {minutes}
      </text>
      <text
        x="84"
        y="112"
        textAnchor="middle"
        fill="var(--faint)"
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
        }}
      >
        MINUTES
      </text>
    </svg>
  );
}
