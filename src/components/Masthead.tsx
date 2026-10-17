import { LogOut } from "lucide-react";

type Props = {
  user: { email?: string | null; name?: string | null } | null;
  onSignOut: () => void;
};

export default function Masthead({ user, onSignOut }: Props) {
  return (
    <header className="border-b border-foreground/15 bg-card/70">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-xl tracking-tight">Ferritin</span>
          <span className="hidden text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            an iron deficiency log
          </span>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="max-w-[12rem] truncate text-xs text-muted-foreground sm:max-w-none sm:text-sm">
              {user.name || user.email}
            </span>
            <button
              onClick={onSignOut}
              className="inline-flex min-h-[2.5rem] items-center gap-1.5 border border-foreground/20 px-3 text-xs font-medium transition-colors hover:bg-secondary"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        ) : (
          <a href="#reference" className="text-xs underline decoration-primary/40 underline-offset-4 hover:decoration-primary">
            The reference tables
          </a>
        )}
      </div>
    </header>
  );
}
