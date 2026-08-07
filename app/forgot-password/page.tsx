import type { Metadata } from "next";
import { ForgotPassword } from "@/components/pages/ForgotPassword";

export const metadata: Metadata = {
  title: "Myelin — Reset your password",
  description: "Request a password reset link for your Myelin account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
