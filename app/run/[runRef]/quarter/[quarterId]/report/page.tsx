import { ReportScreen } from "@/components/run/screens/ReportScreen";

type Props = { params: Promise<{ quarterId: string }> };

export default async function ReportPage({ params }: Props) {
  const { quarterId } = await params;
  return <ReportScreen quarterId={quarterId} />;
}
