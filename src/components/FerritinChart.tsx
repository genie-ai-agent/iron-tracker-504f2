import { num, type Lab } from "@/lib/db";
import { prettyDate } from "@/lib/ranges";

const W = 760;
const H = 280;
const PAD = { top: 18, right: 16, bottom: 34, left: 42 };

export default function FerritinChart({ labs, loading }: { labs: Lab[]; loading: boolean }) {
  const points = labs
    .map((l) => ({ date: l.taken_on, value: num(l.ferritin) }))
    .filter((p): p is { date: string; value: number } => p.value !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (loading && points.length === 0) {
    return <div className="skeleton h-64 w-full" />;
  }

  if (points.length === 0) {
    return (
      <section className="rule-top pt-10">
        <h2 className="text-xl">Ferritin over time</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The chart draws itself once there's a ferritin value in the log. Two draws is where it gets
          useful.
        </p>
      </section>
    );
  }

  const maxVal = Math.max(100, ...points.map((p) => p.value)) * 1.12;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const times = points.map((p) => new Date(p.date + "T00:00:00Z").getTime());
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const spanT = Math.max(maxT - minT, 1);

  const x = (t: number) =>
    points.length === 1 ? PAD.left + innerW / 2 : PAD.left + ((t - minT) / spanT) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  const bands = [
    { from: 0, to: 30, fill: "oklch(0.52 0.19 25 / 0.10)", label: "deficient" },
    { from: 30, to: 50, fill: "oklch(0.64 0.12 90 / 0.12)", label: "low-normal" },
    { from: 50, to: maxVal, fill: "oklch(0.52 0.12 150 / 0.09)", label: "in range" },
  ];

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(times[i]!).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const ticks = [0, 30, 50, 100].filter((t) => t <= maxVal).concat(maxVal > 150 ? [150] : []);

  return (
    <section className="rule-top pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl">Ferritin over time</h2>
        <p className="text-xs text-muted-foreground">
          {points.length} draw{points.length === 1 ? "" : "s"} &middot; {prettyDate(points[0]!.date)} to{" "}
          {prettyDate(points[points.length - 1]!.date)}
        </p>
      </div>

      <div className="mt-5 overflow-hidden border border-foreground/15 bg-card">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Ferritin over time">
          {bands.map((b) => (
            <rect
              key={b.label}
              x={PAD.left}
              y={y(Math.min(b.to, maxVal))}
              width={innerW}
              height={Math.max(y(b.from) - y(Math.min(b.to, maxVal)), 0)}
              fill={b.fill}
            />
          ))}

          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="oklch(0.82 0.01 60)" strokeWidth={1} strokeDasharray={t === 30 ? "0" : "3 4"} />
              <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="oklch(0.52 0.02 40)">
                {Math.round(t)}
              </text>
            </g>
          ))}

          <text x={W - PAD.right} y={y(30) - 7} textAnchor="end" fontSize={10} fill="oklch(0.46 0.14 25)">
            deficiency cut-off &middot; 30
          </text>

          {points.length > 1 && (
            <path d={path} fill="none" stroke="oklch(0.42 0.14 25)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          )}

          {points.map((p, i) => (
            <g key={p.date + i}>
              <circle cx={x(times[i]!)} cy={y(p.value)} r={5} fill="oklch(0.42 0.14 25)" />
              <circle cx={x(times[i]!)} cy={y(p.value)} r={9} fill="none" stroke="oklch(0.42 0.14 25 / 0.3)" strokeWidth={1} />
              <text x={x(times[i]!)} y={y(p.value) - 15} textAnchor="middle" fontSize={12} fontWeight={600} fill="oklch(0.28 0.06 30)">
                {p.value}
              </text>
            </g>
          ))}

          {points.map((p, i) =>
            i === 0 || i === points.length - 1 || points.length <= 6 ? (
              <text
                key={"lbl" + p.date + i}
                x={x(times[i]!)}
                y={H - 12}
                textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
                fontSize={10}
                fill="oklch(0.52 0.02 40)"
              >
                {p.date.slice(5)}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.7rem] text-muted-foreground">
        <span>■ under 30 deficient</span>
        <span>■ 30–50 low-normal</span>
        <span>■ over 50 in range</span>
      </div>
    </section>
  );
}
