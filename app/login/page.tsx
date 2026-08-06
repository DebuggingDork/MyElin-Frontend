import type { Metadata } from "next";
import { Suspense } from "react";
import { Login } from "@/components/pages/Login";

export const metadata: Metadata = {
  title: "Myelin — Log in",
  description: "Log in to Myelin and continue practicing judgment.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void" />}>
      <Login />
    </Suspense>
  );
}
