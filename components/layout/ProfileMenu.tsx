"use client";

/**
 * The account menu.
 *
 * Grouped into the five things an account actually has here -- who you are, what you have run,
 * your password, how the app looks, and where to get help -- with a rule between each group so
 * the list can be scanned rather than read.
 *
 * Every row goes somewhere real. There is deliberately no "notification preferences" entry:
 * the backend stores no notification settings, so the row would be a switch wired to nothing.
 * The same test was applied to each of the others -- "My simulations" and "Completed" are
 * filters over `GET /companies`, "Security & password" is the Supabase password surface the
 * backend already proxies, "Appearance" is the theme the whole app already reads, and
 * "Help" / "Contact" are pages that exist.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  CircleCheck,
  LifeBuoy,
  LogOut,
  Mail,
  Moon,
  Play,
  Plus,
  ShieldCheck,
  Sun,
  UserPen,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { api } from "@/lib/api/client";
import { runHref } from "@/lib/run/ref";
import type { CompanyListItem, ProfileResponse, RunStatus } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Pill, type Accent } from "@/components/ui/Kit";
import { humanizeId } from "@/lib/format/display";
import { cn } from "@/lib/utils";
import { useSimulationHref } from "@/components/play/entry";

const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  active: "Active",
  distressed: "Distressed",
  failed: "Failed",
  completed: "Completed",
};

const RUN_STATUS_ACCENT: Record<RunStatus, Accent> = {
  active: "teal",
  distressed: "amber",
  failed: "rose",
  completed: "emerald",
};

/** How many runs the menu lists inline before deferring to `/runs`. Three keeps the panel
 *  scannable at a glance; the full history is one click away and always was. */
const RECENT_LIMIT = 3;

function initials(email: string, firstName?: string | null) {
  if (firstName?.trim()) {
    const parts = firstName.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]/).filter(Boolean);
  const chars = parts.length >= 2 ? [parts[0]?.[0], parts[1]?.[0]] : [local[0], local[1]];
  return chars.filter(Boolean).join("").toUpperCase() || "?";
}

function Avatar({
  email,
  firstName,
  size = 28,
}: {
  email: string;
  firstName?: string | null;
  size?: number;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-semibold uppercase text-[#071a16]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: "linear-gradient(135deg, var(--teal), var(--teal-bright))",
      }}
    >
      {initials(email, firstName)}
    </span>
  );
}

/** A group heading plus its rule. The dividers are what make the menu readable at a glance. */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line px-2 py-2">
      <p className="px-3 pb-1 pt-1.5 text-[10.5px] uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      {children}
    </div>
  );
}

const rowClass =
  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] text-dim transition-colors hover:bg-[var(--panel-2)] hover:text-ink";

function Row({
  href,
  icon: Icon,
  children,
  onSelect,
  meta,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onSelect: () => void;
  meta?: React.ReactNode;
}) {
  return (
    <Link href={href} onClick={onSelect} className={rowClass}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {meta}
    </Link>
  );
}

export function ProfileMenu() {
  const simulationHref = useSimulationHref();

  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [runs, setRuns] = useState<CompanyListItem[] | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Loaded on first open rather than on mount: the menu is chrome on every page, and a closed
  // menu has nothing to show for the two requests.
  useEffect(() => {
    if (!open || !user || runs !== null) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const [{ entries }, me] = await Promise.all([
          api.listCompanies(),
          api.getProfile().catch(() => null),
        ]);
        if (cancelled) return;
        setRuns(entries);
        setProfile(me);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load your account.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user, runs]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const close = () => setOpen(false);
  const recent = (runs ?? []).slice(0, RECENT_LIMIT);
  const completed = (runs ?? []).filter(
    (r) => r.run_status === "completed" || r.run_status === "failed",
  ).length;
  const displayName = profile?.first_name?.trim() || user.email.split("@")[0];

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-2.5 text-[13px] text-ink transition-colors hover:border-line-2 hover:bg-[var(--panel-2)] sm:pr-3"
      >
        <Avatar email={user.email} firstName={profile?.first_name} />
        <span className="hidden max-w-[140px] truncate sm:inline">{displayName}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-dim transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          aria-label="Account"
          /* Width tracks the viewport so the panel never overflows a narrow phone, and the
             list scrolls inside its own box rather than pushing the page taller than the
             screen. */
          className="absolute right-0 top-[calc(100%+10px)] max-h-[min(78vh,42rem)] w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-void/97 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          {/* ── Profile ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 px-4 py-4">
            <Avatar email={user.email} firstName={profile?.first_name} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-ink">{displayName}</p>
              <p className="truncate text-[11.5px] text-faint">{user.email}</p>
            </div>
            <Pill accent="teal">{humanizeId(profile?.role ?? "student")}</Pill>
          </div>
          <div className="px-2 pb-2">
            <Row href="/profile" icon={UserPen} onSelect={close}>
              Edit profile
            </Row>
          </div>

          {/* ── Simulations ─────────────────────────────────────────── */}
          <Section label="Simulations">
            {loading && <p className="px-3 py-2 text-[12.5px] text-dim">Loading your runs…</p>}

            {!loading && error && <p className="px-3 py-2 text-[12.5px] text-dim">{error}</p>}

            {!loading && !error && recent.length > 0 && (
              <div className="pb-1">
                {recent.map((run) => (
                  <Link
                    key={run.id}
                    href={runHref(run.seq, "/simulation")}
                    onClick={close}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-[var(--panel-2)]"
                  >
                    <span className="num w-8 shrink-0 text-[11px] text-faint">
                      #{run.seq}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-ink">{run.name}</span>
                      <span className="num block text-[11px] text-faint">
                        Q{run.quarters_locked}/{run.total_quarters}
                      </span>
                    </span>
                    <Pill accent={RUN_STATUS_ACCENT[run.run_status]}>
                      {RUN_STATUS_LABEL[run.run_status]}
                    </Pill>
                  </Link>
                ))}
              </div>
            )}

            {!loading && !error && runs !== null && runs.length === 0 && (
              <p className="px-3 py-2 text-[12.5px] text-dim">No simulations started yet.</p>
            )}

            <Row
              href="/runs"
              icon={Play}
              onSelect={close}
              meta={
                runs ? <span className="num text-[11px] text-faint">{runs.length}</span> : null
              }
            >
              My simulations
            </Row>
            <Row
              href="/runs?filter=completed"
              icon={CircleCheck}
              onSelect={close}
              meta={
                runs ? <span className="num text-[11px] text-faint">{completed}</span> : null
              }
            >
              Completed
            </Row>
            <Row href={simulationHref} icon={Plus} onSelect={close}>
              New simulation
            </Row>
          </Section>

          {/* ── Account & security ──────────────────────────────────── */}
          <Section label="Account & security">
            <Row href="/account/security" icon={ShieldCheck} onSelect={close}>
              Security &amp; password
            </Row>
            <Row href="/forgot-password" icon={Mail} onSelect={close}>
              Send a password reset
            </Row>
          </Section>

          {/* ── Preferences ─────────────────────────────────────────── */}
          <Section label="Preferences">
            <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2">
              <span className="text-[13px] text-dim">Appearance</span>
              <div
                role="radiogroup"
                aria-label="Appearance"
                className="flex items-center rounded-full border border-line p-0.5"
              >
                {(
                  [
                    { id: "light", label: "Light", Icon: Sun },
                    { id: "dark", label: "Dark", Icon: Moon },
                  ] as const
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={theme === id}
                    aria-label={label}
                    title={label}
                    onClick={() => setTheme(id)}
                    className={cn(
                      "flex h-6 w-7 items-center justify-center rounded-full transition-colors",
                      theme === id
                        ? "bg-[var(--panel-2)] text-ink"
                        : "text-faint hover:text-dim",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Support ─────────────────────────────────────────────── */}
          <Section label="Support">
            <Row href="/faq" icon={LifeBuoy} onSelect={close}>
              Help &amp; FAQ
            </Row>
            <Row href="/#institutions" icon={Mail} onSelect={close}>
              Contact us
            </Row>
          </Section>

          {/* ── Session ─────────────────────────────────────────────── */}
          <div className="border-t border-line p-2">
            <button
              type="button"
              onClick={() => {
                logout();
                close();
              }}
              className={cn(rowClass, "hover:bg-rose/[0.09] hover:text-rose")}
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
