import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { AccountSecurity } from "@/components/pages/AccountSecurity";

export const metadata: Metadata = {
  title: "Myelin — Account & security",
  description: "Change your password, request a reset link, and review your session.",
};

export default function AccountSecurityPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <AccountSecurity />
      </main>
      <Footer />
    </>
  );
}
