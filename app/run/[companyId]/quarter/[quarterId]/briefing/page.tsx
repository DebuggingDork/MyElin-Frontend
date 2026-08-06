import { BriefingScreen } from "@/components/run/screens/BriefingScreen";

type Props = { params: Promise<{ quarterId: string }> };

export default async function BriefingPage({ params }: Props) {
  const { quarterId } = await params;
  return <BriefingScreen quarterId={quarterId} />;
}
