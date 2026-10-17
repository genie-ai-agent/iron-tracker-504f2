export type Tone = "critical" | "low" | "borderline" | "good" | "high";

export type Reading = {
  label: string;
  blurb: string;
  tone: Tone;
};

/** Ferritin in ng/mL. Reference cut-offs vary between labs; these follow the
 *  commonly cited adult thresholds for iron deficiency. */
export function ferritinReading(v: number | null): Reading | null {
  if (v === null) return null;
  if (v < 10)
    return {
      label: "Critically low",
      blurb: "Severe iron depletion. Worth asking about IV iron rather than pills.",
      tone: "critical",
    };
  if (v < 20)
    return {
      label: "Deficient",
      blurb: "Iron deficiency range. Stores are empty even if hemoglobin looks fine.",
      tone: "critical",
    };
  if (v < 30)
    return {
      label: "Low",
      blurb: "Below the deficiency cut-off most guidelines use. Symptoms are common here.",
      tone: "low",
    };
  if (v < 50)
    return {
      label: "Low-normal",
      blurb: "Inside lab range, but under the level usually aimed for when symptoms persist.",
      tone: "borderline",
    };
  if (v <= 150)
    return {
      label: "In range",
      blurb: "Comfortably stocked. Hair and energy typically catch up months after this point.",
      tone: "good",
    };
  return {
    label: "Above range",
    blurb: "Higher than typical. Worth raising with your clinician, especially after infusions.",
    tone: "high",
  };
}

/** Hemoglobin in g/dL. Anemia cut-offs: 12 for women, 13 for men. */
export function hemoglobinReading(v: number | null): Reading | null {
  if (v === null) return null;
  if (v < 8)
    return { label: "Severe", blurb: "Severely low hemoglobin.", tone: "critical" };
  if (v < 11)
    return { label: "Anemic", blurb: "Below the anemia threshold.", tone: "critical" };
  if (v < 12)
    return { label: "Borderline", blurb: "Around the 12 g/dL cut-off used for women.", tone: "low" };
  if (v <= 16)
    return { label: "In range", blurb: "Normal adult range.", tone: "good" };
  return { label: "Above range", blurb: "Higher than typical.", tone: "high" };
}

/** Transferrin saturation, percent. Under 20% points to iron deficiency. */
export function tsatReading(v: number | null): Reading | null {
  if (v === null) return null;
  if (v < 10) return { label: "Very low", blurb: "Very little iron in transit.", tone: "critical" };
  if (v < 20) return { label: "Low", blurb: "Under the 20% deficiency cut-off.", tone: "low" };
  if (v <= 50) return { label: "In range", blurb: "Normal saturation.", tone: "good" };
  return { label: "Above range", blurb: "Higher than typical.", tone: "high" };
}

export const toneClasses: Record<Tone, string> = {
  critical: "bg-[oklch(0.94_0.06_25)] text-[oklch(0.38_0.16_25)] border-[oklch(0.78_0.11_25)]",
  low: "bg-[oklch(0.95_0.06_60)] text-[oklch(0.40_0.12_55)] border-[oklch(0.82_0.10_60)]",
  borderline: "bg-[oklch(0.96_0.05_95)] text-[oklch(0.40_0.08_90)] border-[oklch(0.85_0.08_95)]",
  good: "bg-[oklch(0.95_0.05_150)] text-[oklch(0.36_0.09_150)] border-[oklch(0.82_0.08_150)]",
  high: "bg-[oklch(0.95_0.03_260)] text-[oklch(0.38_0.09_260)] border-[oklch(0.82_0.06_260)]",
};

export const toneDot: Record<Tone, string> = {
  critical: "oklch(0.52 0.19 25)",
  low: "oklch(0.60 0.15 55)",
  borderline: "oklch(0.64 0.12 90)",
  good: "oklch(0.52 0.12 150)",
  high: "oklch(0.52 0.12 260)",
};

export const SYMPTOMS = [
  { key: "fatigue", label: "Fatigue" },
  { key: "dizziness", label: "Dizziness" },
  { key: "brain_fog", label: "Brain fog" },
  { key: "hair_loss", label: "Hair shedding" },
  { key: "headaches", label: "Headaches" },
] as const;

export type SymptomKey = (typeof SYMPTOMS)[number]["key"];

export const SCALE = [
  { v: 0, label: "None" },
  { v: 1, label: "Mild" },
  { v: 2, label: "Moderate" },
  { v: 3, label: "Bad" },
  { v: 4, label: "Severe" },
];

export const DOSE_KINDS = [
  "ferrous sulfate",
  "ferrous bisglycinate",
  "ferrous gluconate",
  "heme iron",
  "IV infusion",
  "other",
];

export const today = () => new Date().toISOString().slice(0, 10);

export function daysBetween(a: string, b: string) {
  const ms = new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime();
  return Math.round(ms / 86400000);
}

export function prettyDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
