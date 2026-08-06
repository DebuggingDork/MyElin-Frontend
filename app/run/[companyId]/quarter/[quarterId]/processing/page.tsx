import { ProcessingScreen } from "@/components/run/screens/ProcessingScreen";

type Props = { params: Promise<{ quarterId: string }> };

export default async function ProcessingPage({ params }: Props) {
  const { quarterId } = await params;
  return <ProcessingScreen quarterId={quarterId} />;
}
