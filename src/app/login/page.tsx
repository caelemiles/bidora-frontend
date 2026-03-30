"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

async function firebaseLogin(email: string, password: string) {
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const { auth } = await import("@/lib/firebase");
  return signInWithEmailAndPassword(auth, email, password);
}

async function firebaseGoogleLogin() {
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const { auth } = await import("@/lib/firebase");
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await firebaseLogin(email, password);
      const token = await cred.user.getIdToken();
      localStorage.setItem("token", token);
      router.push("/listings");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      const cred = await firebaseGoogleLogin();
      const token = await cred.user.getIdToken();
      localStorage.setItem("token", token);
      router.push("/listings");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Google sign-in failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between bg-white px-6 py-12 font-sans lg:justify-center lg:gap-8">
      <div className="lg:hidden" />

      <div className="w-full max-w-sm lg:max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">
            Log in to your Bidora account
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-6 shadow-sm"
        >
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-shadow focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-shadow focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-[var(--danger)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 items-center justify-center rounded-xl bg-[var(--primary)] text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogle}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Switch link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* Bottom ad */}
      <div className="mt-8 w-full max-w-sm">
        <AdBanner />
      </div>
    </div>
  );
}

