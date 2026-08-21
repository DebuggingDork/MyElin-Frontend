"use client";

/**
 * Password and session, for a CEO who is already signed in.
 *
 * Both actions here are the auth surface the backend already exposes, used the way Supabase
 * intends:
 *
 *  - Changing the password is `POST /auth/reset-password`, which proxies `PUT /auth/v1/user`
 *    with whatever bearer it is handed. The emailed reset flow hands it a recovery token; a
 *    signed-in user hands it their live session token. Same call, same effect -- so there is
 *    no second endpoint to build and no second code path that can drift.
 *  - Emailing a link is the same `POST /auth/forgot-password` the signed-out page uses, for the
 *    case where someone wants to finish on another device.
 *
 * Nothing on this page invents a setting the backend does not store. Session details are read
 * back out of the token that is already in hand rather than from an endpoint that does not exist.
 */

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound, LogOut, Mail, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { easeOut } from "@/lib/media";
import { useAuth } from "@/components/auth/AuthProvider";
import { api, getToken } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import { Action, Container, Eyebrow, Panel } from "@/components/ui/Kit";
import { ButtonSpinner } from "@/components/ui/Loading";

/**
 * The `exp` claim, read without verifying anything.
 *
 * This is display only -- the server verifies the signature on every request, and a tampered
 * copy here would change nothing but the sentence a user reads. Decoding it beats inventing a
 * "session settings" panel over state the backend does not keep.
 */
function tokenExpiry(token: string | null): Date | null {
  if (!token) return null;
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    return typeof json.exp === "number" ? new Date(json.exp * 1000) : null;
  } catch {
    return null;
  }
}

function Field({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  return (
    <div>
      <label className="eyebrow text-faint" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-3">
        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          id={id}
          type="password"
          required
          minLength={8}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="At least 8 characters"
          className="w-full rounded-full border border-line bg-[var(--panel-2)] py-3.5 pl-11 pr-5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal/60"
        />
      </div>
    </div>
  );
}

export function AccountSecurity() {
  const { user, ready, logout } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);

  const [emailing, setEmailing] = useState(false);
  const [emailNote, setEmailNote] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const expiry = useMemo(() => tokenExpiry(getToken()), []);

  const onChangePassword = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setChangeError(null);
      setChanged(false);

      if (password.length < 8) {
        setChangeError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setChangeError("Passwords do not match.");
        return;
      }

      const token = getToken();
      if (!token) {
        setChangeError("Your session has expired. Log in again to change your password.");
        return;
      }

      setChanging(true);
      try {
        await api.resetPassword({ access_token: token, new_password: password });
        setChanged(true);
        setPassword("");
        setConfirm("");
      } catch (err) {
        setChangeError(
          err instanceof ApiError
            ? err.message || "Could not update your password."
            : "Unable to reach the API.",
        );
      } finally {
        setChanging(false);
      }
    },
    [password, confirm],
  );

  const onEmailLink = useCallback(async () => {
    if (!user) return;
    setEmailError(null);
    setEmailNote(null);
    setEmailing(true);
    try {
      const res = await api.forgotPassword({ email: user.email });
      setEmailNote(res.message);
    } catch (err) {
      setEmailError(
        err instanceof ApiError ? err.message : "Could not send the reset email.",
      );
    } finally {
      setEmailing(false);
    }
  }, [user]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-void pb-14 pt-[68px]">
        <div className="aurora" />
        <div className="grid-lines absolute inset-0" />
        <Container wide className="relative z-10 pt-16 sm:pt-24">
          <Eyebrow accent="teal">Account &amp; security</Eyebrow>
          <h1 className="display mt-5 max-w-3xl text-[clamp(2rem,5vw,3.4rem)] text-ink">
            Your password and session.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-dim">
            Change your password here, or have a reset link sent to your inbox if you would rather
            finish on another device.
          </p>
        </Container>
      </section>

      <section className="border-b border-line bg-base py-16">
        <Container wide>
          {ready && !user && (
            <Panel className="p-8 text-center">
              <p className="text-[15px] text-dim">Log in to manage your password.</p>
              <div className="mt-5 flex justify-center">
                <Action href="/login?next=/account/security">Log in</Action>
              </div>
            </Panel>
          )}

          {user && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start"
            >
              <Panel className="p-6 sm:p-8">
                <div className="flex items-center gap-3 border-b border-line pb-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/[0.14]">
                    <ShieldCheck className="h-4.5 w-4.5 text-teal" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-ink">Change password</p>
                    <p className="text-[12px] text-faint">
                      Takes effect immediately. You stay signed in on this device.
                    </p>
                  </div>
                </div>

                <form onSubmit={onChangePassword} className="mt-7 space-y-5">
                  <Field
                    id="new-password"
                    label="New password"
                    value={password}
                    onChange={(v) => {
                      setChanged(false);
                      setPassword(v);
                    }}
                    autoComplete="new-password"
                  />
                  <Field
                    id="confirm-password"
                    label="Confirm password"
                    value={confirm}
                    onChange={(v) => {
                      setChanged(false);
                      setConfirm(v);
                    }}
                    autoComplete="new-password"
                  />

                  {changeError && (
                    <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
                      {changeError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    <Action type="submit" disabled={changing}>
                      {changing ? <ButtonSpinner /> : <KeyRound className="h-4 w-4" />}
                      {changing ? "Updating…" : "Update password"}
                    </Action>
                    {changed && <span className="text-[12.5px] text-teal">Password updated.</span>}
                  </div>
                </form>
              </Panel>

              <div className="space-y-6">
                <Panel className="p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--panel-2)]">
                      <Mail className="h-4 w-4 text-dim" />
                    </span>
                    <p className="text-[14px] font-medium text-ink">Email me a reset link</p>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-dim">
                    Sends the same link the signed-out{" "}
                    <Link
                      href="/forgot-password"
                      className="text-ink underline decoration-line-2 underline-offset-4 hover:decoration-teal"
                    >
                      forgot-password
                    </Link>{" "}
                    page sends, to {user.email}.
                  </p>

                  {emailNote && (
                    <p className="mt-4 rounded-xl border border-line bg-[var(--panel-2)] px-4 py-3 text-[12.5px] text-ink">
                      {emailNote}
                    </p>
                  )}
                  {emailError && (
                    <p className="mt-4 rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[12.5px] text-rose">
                      {emailError}
                    </p>
                  )}

                  <div className="mt-5">
                    <Action variant="outline" onClick={onEmailLink} disabled={emailing}>
                      {emailing && <ButtonSpinner />}
                      {emailing ? "Sending…" : "Send reset link"}
                    </Action>
                  </div>
                </Panel>

                <Panel className="p-6">
                  <p className="text-[14px] font-medium text-ink">This session</p>
                  <dl className="mt-4 space-y-2.5 text-[12.5px]">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-faint">Signed in as</dt>
                      <dd className="min-w-0 truncate text-dim">{user.email}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-faint">Account ID</dt>
                      <dd className="num text-dim">{user.user_id.slice(0, 8)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-faint">Session renews</dt>
                      <dd className="text-dim">
                        {expiry ? expiry.toLocaleTimeString() : "automatically"}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-[12px] leading-relaxed text-faint">
                    Sessions renew themselves in the background, so a four-quarter run never gets
                    cut short by an expiring token.
                  </p>
                  <div className="mt-5">
                    <Action variant="outline" onClick={logout}>
                      <LogOut className="h-3.5 w-3.5" />
                      Log out
                    </Action>
                  </div>
                </Panel>
              </div>
            </motion.div>
          )}
        </Container>
      </section>
    </>
  );
}
