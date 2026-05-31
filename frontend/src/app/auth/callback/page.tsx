"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api, setStoredToken, setStoredUser } from "@/lib/api-client";
import { APP_NAME } from "@/lib/brand";

function OAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing sign-in…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      setFailed(true);
      setMessage(decodeURIComponent(error));
      return;
    }

    if (!token) {
      setFailed(true);
      setMessage("Missing sign-in token. Please try again.");
      return;
    }

    setStoredToken(token);
    api
      .me()
      .then((res) => {
        setStoredUser(res.user);
        router.replace("/dashboard");
      })
      .catch(() => {
        setFailed(true);
        setMessage("Could not load your account after sign-in.");
      });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-8 text-center">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">{APP_NAME}</p>
        <h1 className="mt-4 text-xl font-semibold">{failed ? "Sign-in issue" : "Signing you in…"}</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
        {failed ? (
          <Link href="/login" className="ds-btn ds-btn-primary mt-6 inline-flex px-5 py-2.5">
            Back to login
          </Link>
        ) : (
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-600 dark:border-zinc-700 dark:border-t-violet-400" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-600" />
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}
