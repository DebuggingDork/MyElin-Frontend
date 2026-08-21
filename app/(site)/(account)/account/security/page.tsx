import type { Metadata } from "next";
import { AccountSecurity } from "@/components/pages/AccountSecurity";

export const metadata: Metadata = {
  title: "Myelin — Account & security",
  description: "Change your password, request a reset link, and review your session.",
};

export default function AccountSecurityPage() {
  return <AccountSecurity />;
}
