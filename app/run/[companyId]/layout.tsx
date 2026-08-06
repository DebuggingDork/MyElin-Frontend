import { RunProvider } from "@/components/run/RunProvider";
import { RunShell } from "@/components/run/RunShell";

export default async function RunLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return (
    <RunProvider companyId={companyId}>
      <RunShell>{children}</RunShell>
    </RunProvider>
  );
}
