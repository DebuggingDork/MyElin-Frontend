import type { Metadata } from "next";
import { ResetPassword } from "@/components/pages/ResetPassword";

export const metadata: Metadata = {
  title: "Myelin — Set a new password",
  description: "Complete a password reset for your Myelin account.",
};

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
