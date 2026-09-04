"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Action, Eyebrow } from "@/components/ui/Kit";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import { ButtonSpinner } from "@/components/ui/Loading";

export function ForgotPassword() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await api.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError(
            err.message || 
            "Too many password reset attempts. Please wait an hour before trying again."
          );
        } else if (err.status === 500) {
          setError(
            err.message || 
            "Password reset is temporarily unavailable. Please try again later or contact support."
          );
        } else {
          setError(
            err.message || "Unable to send reset email. Please check your email address and try again."
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
          <Eyebrow accent="teal">Reset your password</Eyebrow>
          <h1 className="display mt-5 text-[clamp(1.6rem,3vw,2.1rem)] leading-[1.05] text-ink">
            Forgot your <span className="text-grad">password?</span>
          </h1>
          <p className="mt-3 text-[14.5px] text-dim">
            Enter the email you registered with and we&apos;ll send a link to reset it.
          </p>

          {user && (
            /* Someone already signed in does not need a link emailed to them to prove who they
               are -- the session does that. Offer the direct change first: it is one screen,
               it works when email delivery is off, and it is the path most people arriving
               here actually want. */
            <div className="mt-7 border border-line bg-[var(--panel-2)] px-4 py-4">
              <p className="text-[13.5px] text-ink">
                You are signed in as{" "}
                <span className="font-medium">{user.email}</span> — you can change your
                password directly, without waiting for an email.
              </p>
              <div className="mt-4">
                <Action href="/account/security" className="w-full">
                  Change it here
                </Action>
              </div>
            </div>
          )}

          {sent ? (
            <div className="mt-8 rounded-xl border border-emerald/30 bg-emerald/[0.07] px-4 py-4">
              <p className="text-[13.5px] font-medium text-emerald">
                Check your email
              </p>
              <p className="mt-2 text-[13px] text-ink">
                If that email is registered, a reset link is on its way. Check your inbox and spam folder. The link opens the reset page here and expires after an hour.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div>
                <label className="eyebrow text-faint" htmlFor="forgot-email">
                  Email <span className="text-rose">*</span>
                </label>
                <div className="relative mt-3">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
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
                {pending ? "Sending…" : "Send reset link"}
              </Action>
            </form>
          )}

          <p className="mt-7 text-center text-[14px] text-dim">
            Remembered it?{" "}
            <Link
              href="/login"
              className="text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:decoration-teal"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
