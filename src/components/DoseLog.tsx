import { useState } from "react";
import { Trash2 } from "lucide-react";
import { db, num, type Dose } from "@/lib/db";
import { DOSE_KINDS, today, prettyDate, daysBetween } from "@/lib/ranges";

const field =
  "mt-1 min-h-[2.75rem] w-full border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

function lastDays(n: number) {
  const out: string[] = [];
  const base = new Date(today() + "T00:00:00Z").getTime();
  for (let i = n - 1; i >= 0; i--) out.push(new Date(base - i * 86400000).toISOString().slice(0, 10));
  return out;
}

export default function DoseLog({
  doses,
  loading,
  onChanged,
}: {
  doses: Dose[];
  loading: boolean;
  onChanged: () => Promise<void>;
}) {
  const [takenOn, setTakenOn] = useState(today());
  const [kind, setKind] = useState(DOSE_KINDS[0]!);
  const [mg, setMg] = useState("");
  const [withC, setWithC] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amount = mg ? Number(mg) : null;
    if (amount !== null && (amount < 0 || amount > 2000)) {
      setError("Elemental iron should be between 0 and 2000 mg.");
      return;
    }
    setBusy(true);
    const row: Record<string, unknown> = { taken_on: takenOn, kind, with_vitamin_c: withC };
    if (amount !== null) row.elemental_mg = amount;
    const { error: err } = await db.from("doses").insert(row).select();
    setBusy(false);
    if (err) {
      setError(err.message ?? "Couldn't save that dose.");
      return;
    }
    setMg("");
    await onChanged();
  };

  const remove = async (id: number) => {
    setRemoving(id);
    const { error: err } = await db.from("doses").delete().eq("id", id);
    if (err) setError(err.message ?? "Couldn't delete that dose.");
    await onChanged();
    setRemoving(null);
  };

  const strip = lastDays(28);
  const byDay = new Map<string, Dose[]>();
  for (const d of doses) byDay.set(d.taken_on, [...(byDay.get(d.taken_on) ?? []), d]);
  const last28 = doses.filter((d) => daysBetween(d.taken_on, today()) <= 27).length;

  return (
    <section className="rule-top mt-14 pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl">Dose log</h2>
        <span className="text-xs text-muted-foreground">{last28} in the last 28 days</span>
      </div>

      <div className="mt-5 grid gap-10 lg:grid-cols-[22rem_1fr]">
        <form onSubmit={submit} className="min-w-0 border border-foreground/15 bg-card p-5 sm:p-6">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</span>
            <input type="date" required value={takenOn} max={today()} onChange={(e) => setTakenOn(e.target.value)} className={field} />
          </label>
          <label className="mt-3.5 block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">What</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className={field}>
              {DOSE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3.5 block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Elemental iron — mg
            </span>
            <input type="number" step="1" min="0" max="2000" inputMode="numeric" placeholder="65" value={mg} onChange={(e) => setMg(e.target.value)} className={field} />
          </label>
          <label className="mt-4 flex min-h-[2.75rem] items-center gap-3 text-sm">
            <input type="checkbox" checked={withC} onChange={(e) => setWithC(e.target.checked)} className="h-5 w-5 accent-[oklch(0.42_0.14_25)]" />
            Taken with vitamin C
          </label>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 min-h-[2.9rem] w-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
          >
            {busy ? "Saving…" : "Log dose"}
          </button>
          <p className="mt-2 text-[0.7rem] text-muted-foreground">
            Ferrous sulfate 325 mg is about 65 mg elemental iron.
          </p>
        </form>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Last 28 days
          </h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {strip.map((d) => {
              const hits = byDay.get(d) ?? [];
              const hasC = hits.some((h) => h.with_vitamin_c);
              return (
                <span
                  key={d}
                  title={hits.length ? `${prettyDate(d)}: ${hits.map((h) => h.kind).join(", ")}` : prettyDate(d)}
                  className={`h-6 w-6 border text-[0.6rem] leading-6 text-center ${
                    hits.length
                      ? hasC
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary/60 bg-primary/35 text-foreground"
                      : "border-foreground/15 bg-background text-muted-foreground/50"
                  }`}
                >
                  {d.slice(8)}
                </span>
              );
            })}
          </div>
          <p className="mt-2 text-[0.7rem] text-muted-foreground">
            Filled with vitamin C, half-filled without. Gaps between filled squares are the point:
            every other day absorbs more than daily.
          </p>

          {loading && doses.length === 0 ? (
            <div className="mt-6 space-y-2">
              <div className="skeleton h-9 w-full" />
              <div className="skeleton h-9 w-full" />
            </div>
          ) : doses.length === 0 ? (
            <p className="mt-6 border border-dashed border-foreground/25 px-4 py-8 text-center text-sm text-muted-foreground">
              No doses logged yet.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-border border-t border-foreground/20">
              {doses.slice(0, 12).map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="whitespace-nowrap text-muted-foreground">{prettyDate(d.taken_on)}</span>
                  <span className="flex-1 truncate">
                    {d.kind}
                    {num(d.elemental_mg) !== null && <span className="tabular"> &middot; {num(d.elemental_mg)} mg</span>}
                    {d.with_vitamin_c && <span className="text-muted-foreground"> &middot; with vit C</span>}
                  </span>
                  <button
                    onClick={() => remove(d.id)}
                    disabled={removing === d.id}
                    aria-label="Delete dose"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
