import type { Metadata } from "next";
import { Signup } from "@/components/pages/Signup";

export const metadata: Metadata = {
  title: "Myelin — Sign up",
  description: "Create your Myelin account and join the S-25 cohort.",
};

export default function SignupPage() {
  return <Signup />;
}
