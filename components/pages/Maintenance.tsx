import { Wrench, Clock } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Eyebrow } from "@/components/ui/Kit";

/**
 * Maintenance mode page - shown when the application is undergoing
 * scheduled maintenance or updates.
 */
export function Maintenance() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-void">
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />

      <div className="relative z-20 px-5 pt-7 sm:px-8">
        <div className="inline-flex">
          <Logo priority />
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border-2 border-cyan/30 bg-cyan/5">
            <Wrench className="h-16 w-16 text-cyan" strokeWidth={1.5} />
          </div>

          <Eyebrow accent="cyan" className="justify-center">
            Scheduled maintenance
          </Eyebrow>

          <h1 className="display mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-ink">
            We&apos;re upgrading{" "}
            <span className="text-grad">the system.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-dim">
            Myelin is currently undergoing scheduled maintenance to bring you new
            features and improvements. We&apos;ll be back shortly — usually within
            15-30 minutes.
          </p>

          <div className="mt-10 rounded-2xl border border-line bg-void/40 p-6">
            <div className="flex items-center justify-center gap-3 text-[13px]">
              <Clock className="h-4 w-4 text-cyan" />
              <p className="font-medium text-ink">
                Estimated downtime: 15-30 minutes
              </p>
            </div>
            <p className="mt-3 text-[13px] text-dim">
              Your progress and data are safe. Try refreshing this page in a few
              minutes to get back to your simulations.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-void/40 p-6">
            <p className="text-[13px] font-medium text-ink">What&apos;s changing?</p>
            <p className="mt-2 text-[13px] text-dim">
              We&apos;re rolling out performance improvements, bug fixes, and new
              features to enhance your experience. All your runs, allocations, and
              progress remain exactly where you left them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
