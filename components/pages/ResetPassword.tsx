"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Action, Eyebrow } from "@/components/ui/Kit";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";

/** Supabase's recovery-link redirect carries the token in the URL *fragment*
 *  (`#access_token=...&type=recovery`), never the query string -- fragments never reach a
 *  server, so this must be read client-side. An expired/invalid link redirects here with
 *  `#error=...&error_description=...` instead of a token. */
function readRecoveryHash(): { accessToken: string | null; hashError: string | null } {
  if (typeof window === "undefined") return { accessToken: null, hashError: null };
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return {
    accessToken: params.get("access_token"),
    hashError: params.get("error_description") || params.get("error"),
  };
}

export function ResetPassword() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Deferred a tick, same as AuthSlide's mode-sync effect -- lands via a callback rather
    // than synchronously in the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      const { accessToken: token, hashError } = readRecoveryHash();
      if (token) {
        setAccessToken(token);
      } else {
        setLinkError(hashError || "This reset link is invalid or has expired.");
      }
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!accessToken) return;

    setPending(true);
    try {
      await api.resetPassword({ access_token: accessToken, new_password: password });
      setDone(true);
      setTimeout(() => router.replace("/login"), 1500);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setLinkError("This reset link is invalid or has expired — request a new one.");
        setAccessToken(null);
      } else {
        setError(
          err instanceof ApiError
            ? err.message || "Could not update your password."
            : "Unable to reach the API. Is the backend running?",
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-void">
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />

      <div className="relative z-20 px-5 pt-7 sm:px-8">
        <Link href="/" aria-label="Myelin home" className="inline-flex">
          <Logo priority />
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-[1.75rem] border border-line bg-void/60 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-10">
          <Eyebrow accent="teal">Set a new password</Eyebrow>
          <h1 className="display mt-5 text-[clamp(1.6rem,3vw,2.1rem)] leading-[1.05] text-ink">
            Choose a <span className="text-grad">new password.</span>
          </h1>

          {done ? (
            <p className="mt-8 rounded-xl border border-line bg-[var(--panel-2)] px-4 py-3 text-[13.5px] text-ink">
              Password updated. Taking you to login…
            </p>
          ) : linkError ? (
            <>
              <p className="mt-8 rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13.5px] text-rose">
                {linkError}
              </p>
              <p className="mt-7 text-center text-[14px] text-dim">
                <Link
                  href="/forgot-password"
                  className="text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:decoration-teal"
                >
                  Request a new reset link
                </Link>
              </p>
            </>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div>
                <label className="eyebrow text-faint" htmlFor="reset-password">
                  New password <span className="text-rose">*</span>
                </label>
                <div className="relative mt-3">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                  <input
                    id="reset-password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-full border border-line bg-[var(--panel-2)] py-3.5 pl-11 pr-5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal/60"
                  />
                </div>
              </div>

              <div>
                <label className="eyebrow text-faint" htmlFor="reset-confirm-password">
                  Confirm password <span className="text-rose">*</span>
                </label>
                <div className="relative mt-3">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                  <input
                    id="reset-confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full rounded-full border border-line bg-[var(--panel-2)] py-3.5 pl-11 pr-5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal/60"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
                  {error}
                </p>
              )}

              <Action type="submit" className="w-full" size="lg" disabled={pending}>
                {pending ? "Updating…" : "Update password"}
              </Action>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
