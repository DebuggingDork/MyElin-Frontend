import { RunProvider } from "@/components/run/RunProvider";
import { RunShell } from "@/components/run/RunShell";

/**
 * `runRef` is the readable run number the URL carries (`/run/2/simulation`). It is not the
 * company id -- `RunProvider` resolves it to the uuid, which is the only thing the API sees.
 */
export default async function RunLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ runRef: string }>;
}) {
  const { runRef } = await params;
  return (
    <RunProvider runRef={runRef}>
      <RunShell>{children}</RunShell>
    </RunProvider>
  );
}
