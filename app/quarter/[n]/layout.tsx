import type { Metadata } from "next";
import { QuarterProvider } from "@/components/quarter/QuarterProvider";
import { QuarterShell } from "@/components/quarter/Shell";

export const metadata: Metadata = {
  title: "Myelin — Quarter",
  description:
    "Stage decisions across six workspaces, approve the quarter, and run the simulation engine.",
};

export default async function QuarterLayout(
  props: LayoutProps<"/quarter/[n]">,
) {
  const { n } = await props.params;
  const quarter = Math.min(8, Math.max(1, Number.parseInt(n, 10) || 1));

  return (
    <QuarterProvider quarter={quarter}>
      <QuarterShell>{props.children}</QuarterShell>
    </QuarterProvider>
  );
}
