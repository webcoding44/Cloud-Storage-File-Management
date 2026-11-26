import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Create account | CloudNest",
  description: "Create a secure CloudNest account for your files.",
};

export default function SignupPage() {
  return <AuthPage mode="signup" />;
}
