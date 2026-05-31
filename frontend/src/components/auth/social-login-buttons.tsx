"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { buildOAuthStartUrl, type OAuthIntent, type OAuthProvider } from "@/lib/oauth";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.6 3.5-5.1 3.5-3.1 0-5.6-2.5-5.6-5.6S8.9 6.1 12 6.1c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 3.8 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.6-3.7 8.6-8.9 0-.6-.1-1-.2-1.3H12z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A8.996 8.996 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function SocialLoginButtons({
  intent,
  selectedPlan,
}: {
  intent: OAuthIntent;
  selectedPlan?: string;
}) {
  const [providers, setProviders] = useState<{ google: boolean; github: boolean } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .oauthProviders()
      .then((res) => {
        if (alive) {
          setFetchError(null);
          setProviders(res.providers);
        }
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setProviders({ google: false, github: false });
        if (process.env.NODE_ENV === "development") {
          const status = err instanceof ApiError ? err.status : null;
          setFetchError(
            status === 404
              ? "Social login API route not found. Run the Laravel API from the project backend folder on port 8000."
              : "Could not load sign-in options from the API.",
          );
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  if (providers === null) {
    return <p className="text-center text-xs text-zinc-500">Loading sign-in options…</p>;
  }

  const enabled = (Object.entries(providers) as [OAuthProvider, boolean][]).filter(([, on]) => on);
  if (enabled.length === 0) {
    if (fetchError) {
      return <p className="text-center text-xs text-amber-600 dark:text-amber-400">{fetchError}</p>;
    }
    if (process.env.NODE_ENV === "development") {
      return (
        <p className="text-center text-xs text-zinc-500">
          Social login is off. Set GOOGLE_CLIENT_ID / GITHUB_CLIENT_ID in the API <code className="text-[11px]">.env</code>.
        </p>
      );
    }
    return null;
  }

  function start(provider: OAuthProvider) {
    window.location.href = buildOAuthStartUrl(provider, intent, selectedPlan);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
        </div>
        <p className="relative flex justify-center text-xs uppercase tracking-wide text-zinc-500">
          <span className="bg-transparent px-2">Or continue with</span>
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {providers.google ? (
          <button
            type="button"
            onClick={() => start("google")}
            className="ds-btn ds-btn-ghost inline-flex w-full items-center justify-center gap-2 py-2.5"
          >
            <GoogleIcon />
            Google
          </button>
        ) : null}
        {providers.github ? (
          <button
            type="button"
            onClick={() => start("github")}
            className="ds-btn ds-btn-ghost inline-flex w-full items-center justify-center gap-2 py-2.5"
          >
            <GitHubIcon />
            GitHub
          </button>
        ) : null}
      </div>
    </div>
  );
}
