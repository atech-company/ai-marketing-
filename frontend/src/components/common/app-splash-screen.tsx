"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "aim_splash_seen";

export function AppSplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (seen) return;

    setVisible(true);
    sessionStorage.setItem(STORAGE_KEY, "1");

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-zinc-950/70 backdrop-blur-md">
      <div className="glass-card animate-enter-fade flex w-[92%] max-w-sm flex-col items-center rounded-3xl px-6 py-8 text-center">
        <div className="animate-pulse-float mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-xl font-bold text-white shadow-lg shadow-violet-500/35">
          AI
        </div>
        <p className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-100">AI Marketing Discovery</p>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Loading your modern workspace...</p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
        </div>
      </div>
    </div>
  );
}
