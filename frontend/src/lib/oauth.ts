export type OAuthProvider = "google" | "github";
export type OAuthIntent = "login" | "register";

function normalizeApiBase(raw: string): string {
  let base = raw.trim().replace(/\/+$/, "");
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is empty");
  base = base.replace(/^\/+/, "");
  if (!/^https?:\/\//i.test(base)) base = `https://${base}`;
  const u = new URL(base.startsWith("http") ? base : `https://${base}`);
  return `${u.protocol}//${u.host}`;
}

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return normalizeApiBase(base);
}

export function buildOAuthStartUrl(
  provider: OAuthProvider,
  intent: OAuthIntent,
  selectedPlan?: string,
): string {
  const url = new URL(`/auth/${provider}/redirect`, `${getApiBaseUrl()}/`);
  url.searchParams.set("intent", intent);
  if (intent === "register" && selectedPlan) {
    url.searchParams.set("selected_plan", selectedPlan);
  }
  return url.href;
}
