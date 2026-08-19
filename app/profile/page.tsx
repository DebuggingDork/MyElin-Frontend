import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Profile } from "@/components/pages/Profile";

export const metadata: Metadata = {
  title: "Myelin — Profile",
  description: "Your account details and simulation history.",
};

export default function ProfilePage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Profile />
      </main>
      <Footer />
    </>
  );
}
