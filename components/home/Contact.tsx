"use client";

import { useState } from "react";
import { ArrowRight, Check, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Action, Container } from "@/components/ui/Kit";
import { LedgerHead } from "@/components/home/LedgerHead";

const CONTACT_EMAIL = "myelindi@gmail.com";

const requestTypes = [
  { value: "Pilot Request", label: "Pilot Request" },
  { value: "General Enquiry / Talk to Us", label: "Talk to Us" },
  { value: "Something else", label: "Something Else" },
] as const;

/**
 * The pricing CTAs (`/?type=pilot#contact`, `/?type=talk#contact`) land here already pointed
 * at the right request type, so the visitor never has to pick it themselves. Read from the
 * URL once at mount (lazy initializer) rather than an effect -- there is nothing to re-sync.
 */
const requestedTypeFor = (url: string): string | null => {
  const type = new URLSearchParams(url).get("type");
  if (type === "pilot") return "Pilot Request";
  if (type === "talk") return "General Enquiry / Talk to Us";
  return null;
};

export function Contact() {
  const [initialType] = useState(() =>
    typeof window === "undefined"
      ? null
      : requestedTypeFor(window.location.search),
  );
  const [requestType, setRequestType] = useState<string>(
    initialType ?? requestTypes[0].value,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [requestCall, setRequestCall] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const subject = `[Myelin Contact] ${requestType}`;
    const lines = [
      `Request type: ${requestType}`,
      `Name: ${name}`,
      `Email: ${email}`,
      requestCall ? "Request a call back: Yes" : null,
      "",
      message,
    ]
      .filter((l): l is string => l !== null)
      .join("\n");

    // Use Gmail compose URL instead of mailto: to avoid browser app selection prompt
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;

    try {
      window.open(gmailUrl, "_blank");
      setSent(true);
    } catch {
      setError("We couldn't open Gmail. Please email us directly at " + CONTACT_EMAIL + ".");
    }
  }

  return (
    <section id="contact" className="relative border-b border-line">
      <Container wide className="ledger-section relative z-10">
        <LedgerHead
          title={
            <>
              Talk to <span className="text-teal">the team.</span>
            </>
          }
          deck={
            <p>
              Tell us what you&apos;re trying to do — a classroom pilot, a
              procurement question, or something else entirely. Submitting opens
              Gmail with your details pre-filled and ready to send.
            </p>
          }
        />

        <div className="mt-16 grid gap-x-16 gap-y-12 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <p className="tick-label border-b border-line pb-3">What happens next</p>
            {[
              {
                title: "You write the request",
                detail: "Pick a request type, tell us who you are and what you need.",
              },
              {
                title: "It opens in Gmail",
                detail: `The message opens in Gmail compose, pre-addressed to ${CONTACT_EMAIL} with everything you entered, ready to send.`,
              },
              {
                title: "We get back to you",
                detail: "Expect a reply from the team with the next step for your request.",
              },
            ].map((step) => (
              <div key={step.title} className="border-b border-line py-4">
                <p className="text-[15.5px] text-ink">{step.title}</p>
                <p className="mt-1.5 text-[13.5px] text-dim">{step.detail}</p>
              </div>
            ))}
          </div>

          <div className="slab p-7 sm:p-9">
            {sent ? (
              <div className="flex flex-col items-start gap-4 py-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal/15 text-teal">
                  <Check className="h-5 w-5" />
                </span>
                <p className="ledger-display text-[24px] text-ink">
                  Thanks! Your request has been received.
                </p>
                <p className="max-w-md text-[14.5px] leading-relaxed text-dim">
                  Gmail should have opened in a new tab with your message ready to
                  send — hit send there and we&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <fieldset>
                  <legend className="tick-label">Request type</legend>
                  <div className="mt-3 grid grid-cols-3 border border-line">
                    {requestTypes.map((option, i) => {
                      const isActive = option.value === requestType;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setRequestType(option.value)}
                          aria-pressed={isActive}
                          className={cn(
                            "px-2 py-3 text-[12.5px] transition-colors duration-200 ease-out sm:text-[13px]",
                            i > 0 && "border-l border-line",
                            isActive
                              ? "bg-teal text-void"
                              : "text-dim hover:bg-[var(--panel)] hover:text-ink",
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="tick-label block">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="mt-3 w-full border border-line bg-[var(--panel)] px-4 py-3.5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="tick-label block">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="mt-3 w-full border border-line bg-[var(--panel)] px-4 py-3.5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="tick-label block">
                    Message / request
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your cohort, programme, or question…"
                    rows={5}
                    className="mt-3 w-full resize-y border border-line bg-[var(--panel)] px-4 py-3.5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal"
                  />
                </div>

                <label className="flex items-start gap-3 text-[14px] text-dim">
                  <input
                    type="checkbox"
                    checked={requestCall}
                    onChange={(e) => setRequestCall(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-teal"
                  />
                  <span>
                    Request a call back — we&apos;ll reply by email first to arrange a time.
                  </span>
                </label>

                {error && (
                  <p className="border border-danger/40 bg-danger/5 px-4 py-3 text-[13.5px] text-danger">
                    {error}
                  </p>
                )}

                <Action type="submit" size="lg" className="w-full justify-center">
                  <Phone className="h-4 w-4" />
                  Send request
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Action>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
