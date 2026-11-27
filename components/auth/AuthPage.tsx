"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Cloud,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/src/auth/client";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AuthIllustration } from "./AuthIllustration";

type AuthMode = "signup" | "signin";

export function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    setPending(true);
    try {
      const result = isSignup
        ? await authClient.signUp.email({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          })
        : await authClient.signIn.email({
            email: email.trim().toLowerCase(),
            password,
          });

      if (result.error) {
        setError(result.error.message || "We could not complete your request. Please try again.");
        return;
      }

      if (isSignup) {
        try {
          const session = await authClient.getSession();
          if (session.data?.user) {
            router.replace("/dashboard");
            router.refresh();
            return;
          }
        } catch {
          // Account creation succeeded; a session may wait for email verification.
        }

        setSuccess("Your account is ready. Check your email if verification is required, then sign in.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("We could not connect to the sign-in service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="CloudNest introduction">
        <div className="auth-story-topline">
          <Link className="auth-brand" href="/" aria-label="CloudNest home">
            <span className="auth-brand-mark"><Cloud size={29} strokeWidth={2.2} /></span>
            <span className="auth-brand-copy">
              <strong>CloudNest</strong>
              <span>CLOUD STORAGE</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="auth-story-copy">
          <p className="auth-eyebrow">PRIVATE CLOUD WORKSPACE</p>
          <h1>Everything you need.<br />All in one place.</h1>
          <p className="auth-story-description">
            Your personal space to store, organize and share files securely from anywhere.
          </p>
        </div>

        <AuthIllustration />

        <div className="auth-story-footer">
          <ShieldCheck size={18} />
          <span>Private by design. Ready wherever you work.</span>
        </div>
      </section>

      <section className="auth-panel" aria-label={isSignup ? "Create your account" : "Sign in"}>
        <div className="auth-panel-topline">
          <span className="auth-security-pill"><LockKeyhole size={15} /> Secure cloud access</span>
        </div>

        <div className="auth-form-wrap">
          <p className="auth-eyebrow">{isSignup ? "GET STARTED" : ""}</p>
          <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
          <p className="auth-form-description">
            {isSignup
              ? "Make a home for your files. It only takes a moment."
              : "Sign in to access your files and continue where you left off."}
          </p>

          {success ? (
            <div className="auth-success-block" role="status">
              <p>{success}</p>
              <Link href="/sign-in">Continue to sign in <ArrowRight size={18} /></Link>
            </div>
          ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <label className="auth-field">
                <span>Full name <b>*</b></span>
                <input
                  autoComplete="name"
                  name="name"
                  placeholder="Your name"
                  required
                  minLength={2}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email address <b>*</b></span>
              <input
                autoComplete="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>Password <b>*</b></span>
              <span className="auth-password-wrap">
                <input
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignup ? "At least 8 characters" : "Your password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
            </label>

            {error && <p className="auth-message auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={pending}>
              {pending ? (
                <><LoaderCircle className="auth-spinner" size={20} /> {isSignup ? "Creating account…" : "Signing in…"}</>
              ) : (
                <>{isSignup ? "Create Account" : "Sign In"} <ArrowRight size={20} /></>
              )}
            </button>
          </form>
          )}

          <p className="auth-switch">
            {isSignup ? "Already have an account?" : "New to CloudNest?"}{" "}
            <Link href={isSignup ? "/sign-in" : "/signup"}>
              {isSignup ? "Sign in" : "Create account"}
            </Link>
          </p>
        </div>

        <p className="auth-panel-footer">Your files, organized and always within reach.</p>
      </section>
    </main>
  );
}
