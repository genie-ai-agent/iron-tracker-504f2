import { useState } from "react";
import { db, signInWithGoogle } from "@/lib/db";

export default function AuthPanel({ onSignedIn }: { onSignedIn: () => Promise<void> }) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res =
        mode === "signup"
          ? await db.auth.signUp.email({ email, password, name: name || email })
          : await db.auth.signIn.email({ email, password });
      if ((res as any)?.error) throw (res as any).error;
      await onSignedIn();
    } catch (err: any) {
      setError(err?.message ?? "That didn't work. Check the email and password.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError("Couldn't open Google sign-in. Try the email form.");
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-5">
      <section className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="rise">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
            Private log &middot; your rows, nobody else's
          </p>
          <h1 className="mt-4 text-[2.6rem] leading-[1.03] sm:text-6xl">
            A ferritin of six<br />
            <span className="italic text-primary">explains</span> all of it.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Fatigue, dizziness, brain fog, hair shedding. The frustrating part of iron deficiency is
            that treatment takes months and feels like nothing is happening. This keeps the
            bloodwork, the symptoms and the doses in one place, so the trend is visible long before
            you feel it.
          </p>

          <dl className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-3">
            {[
              ["Lab history", "Ferritin, hemoglobin and transferrin saturation, charted against the deficiency bands."],
              ["Symptom check-ins", "Five symptoms, zero to four, with a fourteen-day strip per symptom."],
              ["Dose log", "What you took and when, so the every-other-day pattern is obvious."],
            ].map(([t, b]) => (
              <div key={t}>
                <dt className="font-display text-base">{t}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{b}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rise border border-foreground/15 bg-card p-6 shadow-[6px_6px_0_0_oklch(0.42_0.14_25_/_0.08)] sm:p-8">
          <h2 className="text-2xl">{mode === "signup" ? "Start your log" : "Welcome back"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Health data stays private to your account.
          </p>

          <button
            onClick={google}
            className="mt-6 flex min-h-[2.9rem] w-full items-center justify-center gap-2.5 border border-foreground/25 bg-background px-4 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z" />
              <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8z" />
            </svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "signup" && (
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="mt-1 min-h-[2.75rem] w-full border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </label>
            )}
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 min-h-[2.75rem] w-full border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="mt-1 min-h-[2.75rem] w-full border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="min-h-[2.9rem] w-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
            >
              {busy ? "One moment…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
            }}
            className="mt-4 text-xs text-muted-foreground underline decoration-primary/40 underline-offset-4"
          >
            {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </div>
      </section>
    </main>
  );
}
