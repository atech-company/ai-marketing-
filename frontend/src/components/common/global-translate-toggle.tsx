"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
  }
}

type UiLanguage = "en" | "ar";

const LANG_KEY = "aim_ui_lang";

function setTranslateCookie(target: UiLanguage): void {
  const value = target === "ar" ? "/auto/ar" : "/auto/en";
  document.cookie = `googtrans=${value};path=/;max-age=31536000`;
}

function loadGoogleTranslateScript(): void {
  if (document.getElementById("google-translate-script")) return;
  const s = document.createElement("script");
  s.id = "google-translate-script";
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);
}

export function GlobalTranslateToggle() {
  const [lang, setLang] = useState<UiLanguage>("en");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) === "ar" ? "ar" : "en";
    setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    // Hidden container required by Google translate script.
    if (!document.getElementById("google_translate_element")) {
      const el = document.createElement("div");
      el.id = "google_translate_element";
      el.style.display = "none";
      document.body.appendChild(el);
    }
    window.googleTranslateElementInit = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as any).google;
      if (g?.translate?.TranslateElement) {
        // eslint-disable-next-line no-new
        new g.translate.TranslateElement(
          { pageLanguage: "en", includedLanguages: "en,ar", autoDisplay: false },
          "google_translate_element",
        );
      }
    };
    loadGoogleTranslateScript();
  }, []);

  function applyLanguage(next: UiLanguage) {
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
    document.documentElement.lang = next;
    setTranslateCookie(next);
    window.location.reload();
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full border border-zinc-300 bg-white/95 p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900/95">
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
  );
}

