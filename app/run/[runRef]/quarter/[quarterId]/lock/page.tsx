import { LockScreen } from "@/components/run/screens/LockScreen";

type Props = { params: Promise<{ quarterId: string }> };

export default async function LockPage({ params }: Props) {
  const { quarterId } = await params;
  return <LockScreen quarterId={quarterId} />;
}
