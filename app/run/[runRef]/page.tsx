import { redirect } from "next/navigation";

export default async function RunHubPage({
  params,
}: {
  params: Promise<{ runRef: string }>;
}) {
  const { runRef } = await params;
  redirect(`/run/${runRef}/simulation`);
}
