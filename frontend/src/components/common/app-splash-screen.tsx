"use client";

import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/brand";

const SPLASH_DURATION_MS = 5000;

const loadingSteps = [
  "Initializing AI engine…",
  "Preparing marketing workspace…",
  "Loading strategy modules…",
  "Almost ready…",
];

export function AppSplashScreen() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setVisible(true);

    const startedAt = Date.now();
    const progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, Math.round((elapsed / SPLASH_DURATION_MS) * 100));
      setProgress(pct);
      setStepIndex(Math.min(loadingSteps.length - 1, Math.floor((elapsed / SPLASH_DURATION_MS) * loadingSteps.length)));
    }, 50);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, SPLASH_DURATION_MS);

    return () => {
      window.clearInterval(progressInterval);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md">
      <div className="glass-card animate-enter-fade flex w-[92%] max-w-md flex-col items-center rounded-3xl px-8 py-10 text-center">
        <div className="animate-pulse-float mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl font-bold text-white shadow-lg shadow-violet-500/35">
          FK
        </div>
        <p className="text-base font-semibold tracking-wide text-zinc-800 dark:text-zinc-100">{APP_NAME}</p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{loadingSteps[stepIndex]}</p>
        <div className="mt-6 w-full">
          <div className="mb-2 flex justify-between text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span>Loading</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          Turn any website into campaigns, copy, and growth ideas
        </p>
      </div>
    </div>
  );
}
