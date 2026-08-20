import { redirect } from "next/navigation";

export default async function RunHubPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  redirect(`/run/${companyId}/simulation`);
}
