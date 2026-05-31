export type ContentLanguage = "en" | "ar";

export const CONTENT_LANG_KEY = "aim_content_lang";
const LEGACY_UI_LANG_KEY = "aim_ui_lang";

export function getContentLanguage(): ContentLanguage {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(CONTENT_LANG_KEY) ?? localStorage.getItem(LEGACY_UI_LANG_KEY);
  return stored === "ar" ? "ar" : "en";
}

export function setContentLanguage(lang: ContentLanguage): void {
  localStorage.setItem(CONTENT_LANG_KEY, lang);
  localStorage.setItem(LEGACY_UI_LANG_KEY, lang);
  applyDocumentLanguage(lang);
}

export function applyDocumentLanguage(lang: ContentLanguage): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export function contentLanguageLabel(lang: ContentLanguage): string {
  return lang === "ar" ? "العربية" : "English";
}
