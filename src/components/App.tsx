import { useCallback, useEffect, useState } from "react";
import { db, type Lab, type Symptom, type Dose } from "@/lib/db";
import AuthPanel from "./AuthPanel";
import StatusCard from "./StatusCard";
import LabForm from "./LabForm";
import LabTable from "./LabTable";
import FerritinChart from "./FerritinChart";
import SymptomCheckin from "./SymptomCheckin";
import DoseLog from "./DoseLog";
import Masthead from "./Masthead";

type User = { id: string; email?: string | null; name?: string | null } | null;

export default function App() {
  const [user, setUser] = useState<User>(null);
  const [booting, setBooting] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    setLoadError(null);
    const [l, s, d] = await Promise.all([
      db.from("labs").select("id, taken_on, ferritin, hemoglobin, tsat, note").order("taken_on", { ascending: false }).limit(200),
      db.from("symptoms").select("id, logged_on, fatigue, dizziness, brain_fog, hair_loss, headaches").order("logged_on", { ascending: false }).limit(200),
      db.from("doses").select("id, taken_on, kind, elemental_mg, with_vitamin_c").order("taken_on", { ascending: false }).limit(200),
    ]);
    const err = l.error ?? s.error ?? d.error;
    if (err) setLoadError(err.message ?? "Couldn't load your log.");
    setLabs((l.data as Lab[]) ?? []);
    setSymptoms((s.data as Symptom[]) ?? []);
    setDoses((d.data as Dose[]) ?? []);
    setLoadingData(false);
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await db.auth.getSession();
    const next = (data?.user as User) ?? null;
    setUser(next);
    setBooting(false);
    if (next) await loadData();
    else {
      setLabs([]);
      setSymptoms([]);
      setDoses([]);
    }
  }, [loadData]);

  useEffect(() => {
    refresh();
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data === "signed-in") refresh();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [refresh]);

  const signOut = async () => {
    await db.auth.signOut();
    await refresh();
  };

  return (
    <>
      <Masthead user={user} onSignOut={signOut} />

      {booting ? (
        <div className="mx-auto max-w-5xl px-5 py-16">
          <div className="skeleton h-7 w-56" />
          <div className="skeleton mt-4 h-40 w-full" />
        </div>
      ) : !user ? (
        <AuthPanel onSignedIn={refresh} />
      ) : (
        <main className="mx-auto max-w-5xl px-5 pb-16">
          {loadError && (
            <p className="mt-6 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {loadError}
            </p>
          )}

          <StatusCard labs={labs} symptoms={symptoms} doses={doses} loading={loadingData} />
          <FerritinChart labs={labs} loading={loadingData} />

          <section className="rule-top mt-14 pt-10">
            <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
              <LabForm onSaved={loadData} />
              <LabTable labs={labs} loading={loadingData} onChanged={loadData} />
            </div>
          </section>

          <SymptomCheckin symptoms={symptoms} loading={loadingData} onChanged={loadData} />
          <DoseLog doses={doses} loading={loadingData} onChanged={loadData} />
        </main>
      )}
    </>
  );
}
