"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ApiError, api, setStoredToken, setStoredUser } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setStoredToken(res.token);
      setStoredUser(res.user);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell title="Welcome back" subtitle="Sign in to your workspace.">
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-shadow ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-shadow ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <button type="submit" disabled={loading} className="ds-btn ds-btn-primary w-full py-2.5 disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          No account?{" "}
          <Link href="/register" className="font-medium text-violet-600 dark:text-violet-400">
            Register
          </Link>
        </p>
      </form>
    </AuthPageShell>
  );
}
