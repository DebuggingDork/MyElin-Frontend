"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Action, Eyebrow } from "@/components/ui/Kit";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import { ButtonSpinner } from "@/components/ui/Loading";

/** Supabase's recovery-link redirect carries the token in the URL *fragment*
 *  (`#access_token=...&type=recovery`) -- fragments never reach a server, so this must be read
 *  client-side. An expired/invalid link arrives with `error`/`error_description` instead of a
 *  token, and GoTrue puts those in the query string on some paths and the fragment on others,
 *  so both are read here: reporting "invalid or expired" when Supabase actually said why is
 *  the difference between a user who can act on it and one who just tries again. */
function readRecoveryLink(): {
  accessToken: string | null;
  linkError: string | null;
} {
  if (typeof window === "undefined") return { accessToken: null, linkError: null };

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const read = (key: string) => hash.get(key) || query.get(key);

  const accessToken = read("access_token");
  if (accessToken) return { accessToken, linkError: null };

  const described = read("error_description") || read("error");
  if (described) return { accessToken: null, linkError: described.replace(/\+/g, " ") };

  // A `code` means the Supabase project is on the PKCE flow, whose one-time verifier is held
  // by a Supabase client this app does not run -- so the token cannot be recovered from here.
  // Say that plainly rather than blaming the link, which is not what is wrong.
  if (read("code")) {
    return {
      accessToken: null,
      linkError:
        "This reset link is in a format this page cannot complete. Ask an administrator to " +
        "set the Supabase project's auth flow to implicit, then request a new link.",
    };
  }

  return { accessToken: null, linkError: null };
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
      const { accessToken: token, linkError: described } = readRecoveryLink();
      if (token) {
        setAccessToken(token);
        // Keep the recovery token out of the address bar, browser history and any outbound
        // Referer once it has been read -- it is a live credential until it is spent.
        window.history.replaceState(null, "", window.location.pathname);
      } else {
        setLinkError(described || "This reset link is invalid or has expired.");
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
      setError("Passwords do not match. Please try again.");
      return;
    }
    if (!accessToken) return;

    setPending(true);
    try {
      await api.resetPassword({ access_token: accessToken, new_password: password });
      setDone(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          const msg = err.message?.toLowerCase() || "";
          // Check if it's a token/link issue vs password issue
          if (msg.includes("expired") || msg.includes("invalid") || msg.includes("reset link")) {
            setLinkError(
              err.message || "This reset link has expired or is invalid. Please request a new one."
            );
            setAccessToken(null);
          } else if (msg.includes("password") && (msg.includes("weak") || msg.includes("short"))) {
            setError(
              err.message || "Password is too weak. Use at least 8 characters with a mix of letters and numbers."
            );
          } else {
            setError(err.message || "Unable to update password. Please try again.");
          }
        } else {
          setError(
            err.message || "Unable to update password. Please try again or request a new reset link."
          );
        }
      } else {
        setError(
          "Unable to reach the server. Please check your connection and try again."
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
            <div className="mt-8 rounded-xl border border-emerald/30 bg-emerald/[0.07] px-4 py-4">
              <p className="text-[13.5px] font-medium text-emerald">
                Password updated successfully!
              </p>
              <p className="mt-2 text-[13px] text-ink">
                Taking you to login where you can use your new password…
              </p>
            </div>
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
                {pending && <ButtonSpinner />}
                {pending ? "Updating…" : "Update password"}
              </Action>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
