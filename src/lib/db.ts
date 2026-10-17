import { createClient } from "@neondatabase/neon-js";

export const db = createClient({
  auth: {
    url: "https://ep-round-tooth-b8dukeql.neonauth.c-14.us-east-1.aws.neon.tech/neondb/auth",
    allowAnonymous: true,
  },
  dataApi: {
    url: "https://ep-round-tooth-b8dukeql.apirest.c-14.us-east-1.aws.neon.tech/neondb/rest/v1",
  },
});

export async function signInWithGoogle() {
  const popup = window.open("about:blank", "signin", "width=480,height=640");

  const { data, error } = await db.auth.signIn.social({
    provider: "google",
    callbackURL: `${window.location.origin}/auth-callback.html`,
    errorCallbackURL: `${window.location.origin}/auth-callback.html`,
    disableRedirect: true,
  });

  if (error || !data?.url) {
    popup?.close();
    throw error ?? new Error("no sign-in url");
  }

  if (popup) popup.location.href = data.url;
  else window.location.href = data.url;
}

export type Lab = {
  id: number;
  taken_on: string;
  ferritin: string | number | null;
  hemoglobin: string | number | null;
  tsat: string | number | null;
  note: string | null;
};

export type Symptom = {
  id: number;
  logged_on: string;
  fatigue: number;
  dizziness: number;
  brain_fog: number;
  hair_loss: number;
  headaches: number;
};

export type Dose = {
  id: number;
  taken_on: string;
  kind: string;
  elemental_mg: string | number | null;
  with_vitamin_c: boolean;
};

export const num = (v: string | number | null | undefined): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
