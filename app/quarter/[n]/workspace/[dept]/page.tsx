import { notFound } from "next/navigation";
import { WorkspaceScreen } from "@/components/quarter/WorkspaceScreen";
import { catalogs } from "@/lib/quarter/catalog";
import type { WorkspaceId } from "@/lib/quarter/types";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ n: string; dept: string }>;
}) {
  const { dept } = await params;
  if (!(dept in catalogs)) notFound();
  return <WorkspaceScreen ws={dept as WorkspaceId} />;
}
