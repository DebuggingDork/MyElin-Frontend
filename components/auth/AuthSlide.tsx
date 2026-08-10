"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { easeOut, photos } from "@/lib/media";
import { ApiError } from "@/lib/api/types";
import { Action, Eyebrow } from "@/components/ui/Kit";

type Mode = "login" | "signup";

/**
 * Sliding auth: login = form left + photo right.
 * Signup slides the track so photo is left and form is right.
 */
export function AuthSlide({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/simulations";
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // Deferred a tick so this lands via a callback rather than synchronously in the effect
    // body (react-hooks/set-state-in-effect) -- resolves before the next paint regardless.
    queueMicrotask(() => {
      setMode(initialMode);
      setError(null);
    });
  }, [initialMode]);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setConfirmPassword("");
    router.replace(`/${nextMode}?next=${encodeURIComponent(next)}`, {
      scroll: false,
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password });
      }
      router.replace(next);
    } catch (err) {
      // 429 is the only auth failure whose own message ("email rate limit exceeded") reads as
      // jargon rather than an instruction, so it gets replacement copy. Every other rejection
      // now arrives with Supabase's real, already-human reason in `detail` (bad address, weak
      // password, invalid credentials) and is shown verbatim by the branch below.
      if (err instanceof ApiError && err.status === 429) {
        setError(
          "Too many attempts right now. Wait a minute and try again — if you already registered, log in instead.",
        );
      } else {
        setError(
          err instanceof ApiError
            ? err.message || (mode === "login" ? "Login failed" : "Signup failed")
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

      <div className="relative z-10 flex flex-1 items-center px-4 py-10 sm:px-8">
        <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-line bg-void/60 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          {/* Mobile: stacked photo + form */}
          <div className="lg:hidden">
            <PhotoPanel
              mode={mode}
              onSwitch={switchMode}
              compact
            />
            <div className="p-6 sm:p-8">
              <AuthForm
                mode={mode}
                email={email}
                password={password}
                confirmPassword={confirmPassword}
                error={error}
                pending={pending}
                onEmail={setEmail}
                onPassword={setPassword}
                onConfirmPassword={setConfirmPassword}
                onSubmit={onSubmit}
                onSwitch={switchMode}
                next={next}
              />
            </div>
          </div>

          {/* Desktop: sliding track — login [form|photo], signup [photo|form] */}
          <div className="relative hidden min-h-[36rem] overflow-hidden lg:block">
            <motion.div
              className="flex h-full w-[200%]"
              animate={{ x: mode === "login" ? "0%" : "-50%" }}
              transition={{ duration: 0.7, ease: easeOut }}
            >
              {/* Panel A — login layout */}
              <div
                className="grid h-full w-1/2 grid-cols-2"
                aria-hidden={mode !== "login"}
                inert={mode !== "login" ? true : undefined}
              >
                <div className="flex items-center p-8 xl:p-10">
                  <AuthForm
                    mode="login"
                    email={email}
                    password={password}
                    confirmPassword={confirmPassword}
                    error={mode === "login" ? error : null}
                    pending={pending && mode === "login"}
                    onEmail={setEmail}
                    onPassword={setPassword}
                    onConfirmPassword={setConfirmPassword}
                    onSubmit={onSubmit}
                    onSwitch={switchMode}
                    next={next}
                    hideSwitch
                  />
                </div>
                <PhotoPanel mode="login" onSwitch={switchMode} />
              </div>

              {/* Panel B — signup layout */}
              <div
                className="grid h-full w-1/2 grid-cols-2"
                aria-hidden={mode !== "signup"}
                inert={mode !== "signup" ? true : undefined}
              >
                <PhotoPanel mode="signup" onSwitch={switchMode} />
                <div className="flex items-center p-8 xl:p-10">
                  <AuthForm
                    mode="signup"
                    email={email}
                    password={password}
                    confirmPassword={confirmPassword}
                    error={mode === "signup" ? error : null}
                    pending={pending && mode === "signup"}
                    onEmail={setEmail}
                    onPassword={setPassword}
                    onConfirmPassword={setConfirmPassword}
                    onSubmit={onSubmit}
                    onSwitch={switchMode}
                    next={next}
                    hideSwitch
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthForm({
  mode,
  email,
  password,
  confirmPassword,
  error,
  pending,
  onEmail,
  onPassword,
  onConfirmPassword,
  onSubmit,
  onSwitch,
  next,
  hideSwitch = false,
}: {
  mode: Mode;
  email: string;
  password: string;
  confirmPassword: string;
  error: string | null;
  pending: boolean;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onConfirmPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitch: (m: Mode) => void;
  next: string;
  hideSwitch?: boolean;
}) {
  const isLogin = mode === "login";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full">
      <Eyebrow accent={isLogin ? "cyan" : "violet"}>
        {isLogin ? "Welcome back" : "Join the S-25 cohort"}
      </Eyebrow>
      <h1 className="display mt-5 text-[clamp(1.7rem,3vw,2.25rem)] leading-[1.05] text-ink">
        {isLogin ? (
          <>
            Log in to <span className="text-grad">Myelin</span>
          </>
        ) : (
          <>
            Create your <span className="text-grad">Myelin</span> account
          </>
        )}
      </h1>
      <p className="mt-3 text-[14.5px] text-dim">
        {isLogin
          ? "Pick up where you left your last decision."
          : "Email and password only — then start your first company."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label className="eyebrow text-faint" htmlFor={`${mode}-email`}>
            Email <span className="text-rose">*</span>
          </label>
          <div className="relative mt-3">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              id={`${mode}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => onEmail(e.target.value)}
              placeholder="you@university.edu"
              className="w-full rounded-full border border-line bg-[var(--panel-2)] py-3.5 pl-11 pr-5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal/60"
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label className="eyebrow text-faint" htmlFor={`${mode}-password`}>
              Password <span className="text-rose">*</span>
            </label>
            {isLogin && (
              <Link
                href="/forgot-password"
                className="text-[12.5px] text-dim underline decoration-line-2 underline-offset-4 transition-colors hover:text-ink hover:decoration-teal"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative mt-3">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              id={`${mode}-password`}
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={isLogin ? undefined : 8}
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => onPassword(e.target.value)}
              placeholder={isLogin ? "••••••••" : "At least 8 characters"}
              className="w-full rounded-full border border-line bg-[var(--panel-2)] py-3.5 pl-11 pr-11 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              tabIndex={-1}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div>
            <label className="eyebrow text-faint" htmlFor={`${mode}-confirm-password`}>
              Confirm password <span className="text-rose">*</span>
            </label>
            <div className="relative mt-3">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                id={`${mode}-confirm-password`}
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => onConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-full border border-line bg-[var(--panel-2)] py-3.5 pl-11 pr-11 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal/60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                aria-pressed={showConfirmPassword}
                tabIndex={-1}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-ink"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
            {error}
          </p>
        )}

        <Action type="submit" className="w-full" size="lg" disabled={pending}>
          {pending
            ? isLogin
              ? "Signing in…"
              : "Creating account…"
            : isLogin
              ? "Log in"
              : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </Action>
      </form>

      {!hideSwitch && (
        <p className="mt-7 text-center text-[14px] text-dim">
          {isLogin ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => onSwitch("signup")}
                className="text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:decoration-teal"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => onSwitch("login")}
                className="text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:decoration-teal"
              >
                Log in
              </button>
            </>
          )}
        </p>
      )}

      {/* Keep crawlable links for no-JS / SEO */}
      <p className="sr-only">
        <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
        <Link href={`/signup?next=${encodeURIComponent(next)}`}>Sign up</Link>
      </p>
    </div>
  );
}

function PhotoPanel({
  mode,
  onSwitch,
  compact = false,
}: {
  mode: Mode;
  onSwitch: (m: Mode) => void;
  compact?: boolean;
}) {
  const isLogin = mode === "login";
  const src = isLogin ? photos.teamDecide : photos.whiteboard;

  return (
    <div
      className={`relative overflow-hidden ${compact ? "h-52" : "h-full min-h-[36rem]"}`}
    >
      <Image
        src={src}
        alt={
          isLogin
            ? "Operators deciding around a table"
            : "Team planning strategy on a whiteboard"
        }
        fill
        priority
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background: isLogin
            ? "linear-gradient(160deg, rgba(6,8,14,0.35) 0%, rgba(6,8,14,0.82) 100%)"
            : "linear-gradient(200deg, rgba(6,8,14,0.3) 0%, rgba(6,8,14,0.85) 100%)",
        }}
      />

      <div
        className={`absolute inset-x-0 ${compact ? "bottom-0 p-5" : "bottom-0 p-8 xl:p-10"}`}
      >
        <Eyebrow accent={isLogin ? "pink" : "emerald"}>
          {isLogin ? "New operator?" : "Already running?"}
        </Eyebrow>
        <p
          className={`display mt-3 leading-[1.15] text-ink ${compact ? "text-[22px]" : "text-[28px]"}`}
        >
          {isLogin ? (
            <>
              Create an account and{" "}
              <span className="text-grad-iris">open Q1.</span>
            </>
          ) : (
            <>
              Welcome back —{" "}
              <span className="text-grad-iris">resume the run.</span>
            </>
          )}
        </p>
        <p className={`mt-3 max-w-sm text-dim ${compact ? "text-[12.5px]" : "text-[14px]"}`}>
          {isLogin
            ? "Twenty-four months of company pressure, compressed into consequential choices."
            : "Your allocations, crisis, and lock state wait where you left them."}
        </p>

        <button
          type="button"
          onClick={() => onSwitch(isLogin ? "signup" : "login")}
          className="sweep group relative mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium text-white"
          style={{ background: "var(--grad-primary)" }}
        >
          {isLogin ? "Sign up" : "Log in"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
