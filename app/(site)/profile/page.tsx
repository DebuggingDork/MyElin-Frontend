import type { Metadata } from "next";
import { Profile } from "@/components/pages/Profile";

export const metadata: Metadata = {
  title: "Myelin — Profile",
  description: "Your account details and simulation history.",
};

export default function ProfilePage() {
  return <Profile />;
}
