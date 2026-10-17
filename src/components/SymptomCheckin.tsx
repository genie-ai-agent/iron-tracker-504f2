import { useState } from "react";
import { db, type Symptom } from "@/lib/db";
import { SYMPTOMS, SCALE, today, prettyDate, type SymptomKey } from "@/lib/ranges";

type Scores = Record<SymptomKey, number>;
const blank = (): Scores => ({ fatigue: 0, dizziness: 0, brain_fog: 0, hair_loss: 0, headaches: 0 });

export default function SymptomCheckin({
  symptoms,
  loading,
  onChanged,
}: {
  symptoms: Symptom[];
  loading: boolean;
  onChanged: () => Promise<void>;
}) {
  const [scores, setScores] = useState<Scores>(blank);
  const [day, setDay] = useState(today());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await db.from("symptoms").insert({ logged_on: day, ...scores }).select();
    setBusy(false);
    if (err) {
      setError(err.message ?? "Couldn't save that check-in.");
      return;
    }
    setScores(blank());
    await onChanged();
  };

  const recent = symptoms.slice(0, 14).slice().reverse();

  return (
    <section className="rule-top mt-14 pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl">How today felt</h2>
        <span className="text-xs text-muted-foreground">
          {symptoms.length} check-in{symptoms.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <form onSubmit={submit} className="min-w-0 border border-foreground/15 bg-card p-5 sm:p-6">
          <label className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Date
            <input
              type="date"
              value={day}
              max={today()}
              onChange={(e) => setDay(e.target.value)}
              className="min-h-[2.5rem] border border-input bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none focus:border-ring"
            />
          </label>

          <div className="mt-5 space-y-5">
            {SYMPTOMS.map((s) => (
              <div key={s.key}>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-base">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{SCALE[scores[s.key]]!.label}</span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {SCALE.map((opt) => {
                    const active = scores[s.key] === opt.v;
                    return (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setScores({ ...scores, [s.key]: opt.v })}
                        aria-label={`${s.label}: ${opt.label}`}
                        className={`tabular min-h-[2.75rem] flex-1 border text-sm font-semibold transition-all ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-foreground/20 bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground"
                        }`}
                      >
                        {opt.v}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 min-h-[2.9rem] w-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save check-in"}
          </button>
          <p className="mt-2 text-[0.7rem] text-muted-foreground">0 none &middot; 2 moderate &middot; 4 severe</p>
        </form>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Last 14 check-ins
          </h3>

          {loading && symptoms.length === 0 ? (
            <div className="mt-4 space-y-3">
              <div className="skeleton h-8 w-full" />
              <div className="skeleton h-8 w-full" />
            </div>
          ) : recent.length === 0 ? (
            <p className="mt-4 border border-dashed border-foreground/25 px-4 py-8 text-center text-sm text-muted-foreground">
              No check-ins yet. A week of them is enough to tell a bad stretch from a trend.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {SYMPTOMS.map((s) => {
                const vals = recent.map((r) => r[s.key] ?? 0);
                const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                return (
                  <div key={s.key}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium">{s.label}</span>
                      <span className="tabular text-muted-foreground">avg {avg.toFixed(1)}</span>
                    </div>
                    <div className="mt-1.5 flex h-8 items-end gap-[3px]">
                      {vals.map((v, i) => (
                        <span
                          key={i}
                          title={`${prettyDate(recent[i]!.logged_on)}: ${v}`}
                          className="flex-1 bg-primary/80"
                          style={{ height: `${Math.max((v / 4) * 100, 6)}%`, opacity: 0.35 + (v / 4) * 0.65 }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              <p className="text-[0.7rem] text-muted-foreground">
                Oldest on the left, most recent on the right.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
