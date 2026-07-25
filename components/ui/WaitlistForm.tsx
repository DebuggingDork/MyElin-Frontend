"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

type WaitlistFormProps = {
  id?: string;
  className?: string;
  compact?: boolean;
};

export function WaitlistForm({
  id = "request-access",
  className = "",
  compact = false,
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setStatus("error");
      return;
    }
    // Stub ready to swap for an API later
    console.info("[Myelin waitlist]", email.trim());
    setStatus("ok");
    setEmail("");
  }

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      className={`flex w-full flex-col gap-3 ${compact ? "sm:flex-row sm:items-start" : ""} ${className}`}
      noValidate
    >
      <div className="flex-1">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          className="w-full rounded-md border border-border bg-bg px-4 py-2.5 text-sm text-foreground placeholder:text-muted/70 transition-colors focus:border-brand"
          aria-invalid={status === "error"}
        />
        {status === "error" && (
          <p className="mt-1.5 text-xs text-muted" role="alert">
            Enter a valid email address.
          </p>
        )}
        {status === "ok" && (
          <p className="mt-1.5 text-xs text-brand" role="status">
            You&apos;re on the list. We&apos;ll be in touch.
          </p>
        )}
      </div>
      <Button type="submit" className="shrink-0 whitespace-nowrap">
        Request access
      </Button>
    </form>
  );
}
