import { num, type Lab, type Symptom, type Dose } from "@/lib/db";
import {
  ferritinReading,
  hemoglobinReading,
  tsatReading,
  toneClasses,
  today,
  daysBetween,
  prettyDate,
  SYMPTOMS,
} from "@/lib/ranges";

type Props = { labs: Lab[]; symptoms: Symptom[]; doses: Dose[]; loading: boolean };

export default function StatusCard({ labs, symptoms, doses, loading }: Props) {
  if (loading && labs.length === 0) {
    return (
      <section className="py-10">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton mt-4 h-32 w-full" />
      </section>
    );
  }

  const latest = labs[0] ?? null;
  const previous = labs[1] ?? null;
  const ferritin = latest ? num(latest.ferritin) : null;
  const prevFerritin = previous ? num(previous.ferritin) : null;
  const reading = ferritinReading(ferritin);
  const hgb = hemoglobinReading(latest ? num(latest.hemoglobin) : null);
  const ts = tsatReading(latest ? num(latest.tsat) : null);
  const delta = ferritin !== null && prevFerritin !== null ? ferritin - prevFerritin : null;
  const sinceLab = latest ? daysBetween(latest.taken_on, today()) : null;

  const recentSymptom = symptoms[0] ?? null;
  const burden = recentSymptom
    ? SYMPTOMS.reduce((sum, s) => sum + (recentSymptom[s.key] ?? 0), 0)
    : null;

  const last14 = doses.filter((d) => daysBetween(d.taken_on, today()) <= 13).length;

  if (!latest) {
    return (
      <section className="py-12">
        <h1 className="text-3xl sm:text-4xl">Nothing logged yet</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Start with your most recent blood draw. Ferritin alone is enough to get the chart going,
          and you can backfill older results in any order; they sort themselves by date.
        </p>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-12">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Latest draw &middot; {prettyDate(latest.taken_on)}
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
        <h1 className="tabular text-[3.5rem] leading-none sm:text-7xl">
          {ferritin ?? "—"}
          <span className="ml-2 font-sans text-base font-medium tracking-tight text-muted-foreground">
            ng/mL ferritin
          </span>
        </h1>
        {reading && (
          <span className={`border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${toneClasses[reading.tone]}`}>
            {reading.label}
          </span>
        )}
      </div>

      {reading && (
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{reading.blurb}</p>
      )}

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-foreground/15 pt-6 sm:grid-cols-4">
        <Stat
          label="Change since last"
          value={delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(0)}`}
          note={delta === null ? "needs a second draw" : delta > 0 ? "climbing" : delta < 0 ? "falling" : "flat"}
        />
        <Stat
          label="Hemoglobin"
          value={num(latest.hemoglobin) ?? "—"}
          note={hgb ? hgb.label.toLowerCase() : "not recorded"}
        />
        <Stat
          label="Transferrin sat."
          value={num(latest.tsat) !== null ? `${num(latest.tsat)}%` : "—"}
          note={ts ? ts.label.toLowerCase() : "not recorded"}
        />
        <Stat
          label="Doses, last 14 days"
          value={last14}
          note={burden === null ? "no check-ins yet" : `symptom load ${burden}/20`}
        />
      </dl>

      {sinceLab !== null && sinceLab >= 90 && (
        <p className="mt-6 border-l-2 border-primary bg-accent/40 px-4 py-3 text-sm">
          It's been {sinceLab} days since that draw. Eight to twelve weeks is the usual recheck
          window once you're treating, so this is worth a message to your clinician.
        </p>
      )}
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div>
      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="tabular mt-1 font-display text-2xl">{value}</dd>
      <dd className="text-xs text-muted-foreground">{note}</dd>
    </div>
  );
}
