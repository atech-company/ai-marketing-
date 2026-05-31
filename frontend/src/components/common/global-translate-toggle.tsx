"use client";

import { useEffect, useState } from "react";
import {
  applyDocumentLanguage,
  contentLanguageLabel,
  getContentLanguage,
  setContentLanguage,
  type ContentLanguage,
} from "@/lib/content-language";

export function GlobalTranslateToggle() {
  const [lang, setLang] = useState<ContentLanguage>("en");

  useEffect(() => {
    const saved = getContentLanguage();
    setLang(saved);
    applyDocumentLanguage(saved);
  }, []);

  function applyLanguage(next: ContentLanguage) {
    setLang(next);
    setContentLanguage(next);
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-1"
      title="Content language for AI-generated copy"
    >
      <span className="rounded-full border border-zinc-200 bg-white/95 px-2 py-0.5 text-[10px] font-medium text-zinc-500 shadow dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-400">
        AI content
      </span>
      <div className="flex items-center gap-1 rounded-full border border-zinc-300 bg-white/95 p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900/95">
        <button
          type="button"
          onClick={() => applyLanguage("en")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            lang === "en"
              ? "bg-violet-600 text-white"
              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => applyLanguage("ar")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            lang === "ar"
              ? "bg-violet-600 text-white"
              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          AR
        </button>
      </div>
      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{contentLanguageLabel(lang)}</span>
    </div>
  );
}
