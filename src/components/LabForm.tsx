import { useState } from "react";
import { db } from "@/lib/db";
import { today } from "@/lib/ranges";

const field =
  "mt-1 min-h-[2.75rem] w-full border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

export default function LabForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const [takenOn, setTakenOn] = useState(today());
  const [ferritin, setFerritin] = useState("");
  const [hemoglobin, setHemoglobin] = useState("");
  const [tsat, setTsat] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ferritin && !hemoglobin && !tsat) {
      setError("Add at least one value from the panel.");
      return;
    }
    const f = ferritin ? Number(ferritin) : null;
    const h = hemoglobin ? Number(hemoglobin) : null;
    const t = tsat ? Number(tsat) : null;
    if (f !== null && (f < 0 || f > 5000)) return setError("Ferritin should be between 0 and 5000 ng/mL.");
    if (h !== null && (h < 2 || h > 25)) return setError("Hemoglobin should be between 2 and 25 g/dL.");
    if (t !== null && (t < 0 || t > 100)) return setError("Transferrin saturation is a percentage, 0 to 100.");

    setBusy(true);
    const row: Record<string, unknown> = { taken_on: takenOn };
    if (f !== null) row.ferritin = f;
    if (h !== null) row.hemoglobin = h;
    if (t !== null) row.tsat = t;
    if (note.trim()) row.note = note.trim();

    const { error: err } = await db.from("labs").insert(row).select();
    setBusy(false);

    if (err) {
      setError(err.message ?? "Couldn't save that result.");
      return;
    }
    setFerritin("");
    setHemoglobin("");
    setTsat("");
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    await onSaved();
  };

  return (
    <form onSubmit={submit} className="min-w-0 border border-foreground/15 bg-card p-5 sm:p-6">
      <h2 className="text-xl">Add a blood draw</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Whatever the panel reported. Blank fields are simply left out.
      </p>

      <div className="mt-5 space-y-3.5">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date drawn</span>
          <input type="date" required value={takenOn} max={today()} onChange={(e) => setTakenOn(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ferritin — ng/mL</span>
          <input type="number" step="0.1" min="0" max="5000" inputMode="decimal" placeholder="6" value={ferritin} onChange={(e) => setFerritin(e.target.value)} className={field} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hgb — g/dL</span>
            <input type="number" step="0.1" min="2" max="25" inputMode="decimal" placeholder="11.4" value={hemoglobin} onChange={(e) => setHemoglobin(e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">TSAT — %</span>
            <input type="number" step="0.1" min="0" max="100" inputMode="decimal" placeholder="9" value={tsat} onChange={(e) => setTsat(e.target.value)} className={field} />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Note</span>
          <input type="text" maxLength={200} placeholder="post-infusion, fasting, which clinic…" value={note} onChange={(e) => setNote(e.target.value)} className={field} />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-5 min-h-[2.9rem] w-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
      >
        {busy ? "Saving…" : saved ? "Saved" : "Save result"}
      </button>
    </form>
  );
}
