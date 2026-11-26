import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Sign in | CloudNest",
  description: "Sign in to access your CloudNest files.",
};

export default function SignInPage() {
  return <AuthPage mode="signin" />;
}
