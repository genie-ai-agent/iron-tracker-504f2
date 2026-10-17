import { useState } from "react";
import { Trash2 } from "lucide-react";
import { db, num, type Lab } from "@/lib/db";
import { ferritinReading, toneClasses, prettyDate } from "@/lib/ranges";

export default function LabTable({
  labs,
  loading,
  onChanged,
}: {
  labs: Lab[];
  loading: boolean;
  onChanged: () => Promise<void>;
}) {
  const [removing, setRemoving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: number) => {
    setRemoving(id);
    setError(null);
    const { error: err } = await db.from("labs").delete().eq("id", id);
    if (err) setError(err.message ?? "Couldn't delete that row.");
    await onChanged();
    setRemoving(null);
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl">Lab history</h2>
        <span className="text-xs text-muted-foreground">
          {labs.length} result{labs.length === 1 ? "" : "s"}, newest first
        </span>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {loading && labs.length === 0 ? (
        <div className="mt-4 space-y-2">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      ) : labs.length === 0 ? (
        <p className="mt-4 border border-dashed border-foreground/25 px-4 py-8 text-center text-sm text-muted-foreground">
          No results yet. Add the most recent draw on the left and this fills in.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-foreground/20 text-left">
                <th className="py-2 pr-3 font-semibold">Date</th>
                <th className="py-2 pr-3 text-right font-semibold">Ferritin</th>
                <th className="py-2 pr-3 text-right font-semibold">Hgb</th>
                <th className="py-2 pr-3 text-right font-semibold">TSAT</th>
                <th className="py-2 pr-3 font-semibold">Reading</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {labs.map((l) => {
                const r = ferritinReading(num(l.ferritin));
                return (
                  <tr key={l.id} className="border-b border-border align-top">
                    <td className="py-3 pr-3 whitespace-nowrap">
                      {prettyDate(l.taken_on)}
                      {l.note && <div className="mt-0.5 text-xs italic text-muted-foreground">{l.note}</div>}
                    </td>
                    <td className="tabular py-3 pr-3 text-right font-display text-base">{num(l.ferritin) ?? "—"}</td>
                    <td className="tabular py-3 pr-3 text-right">{num(l.hemoglobin) ?? "—"}</td>
                    <td className="tabular py-3 pr-3 text-right">{num(l.tsat) !== null ? `${num(l.tsat)}%` : "—"}</td>
                    <td className="py-3 pr-3">
                      {r ? (
                        <span className={`border px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide ${toneClasses[r.tone]}`}>
                          {r.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">no ferritin</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => remove(l.id)}
                        disabled={removing === l.id}
                        aria-label="Delete result"
                        className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
