import type { Metadata } from "next";
import { Suspense } from "react";
import { Signup } from "@/components/pages/Signup";

export const metadata: Metadata = {
  title: "Myelin — Sign up",
  description: "Create a Myelin account and start practicing judgment.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void" />}>
      <Signup />
    </Suspense>
  );
}
