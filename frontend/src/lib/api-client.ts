import type {
  AuthResponse,
  AdminUserRow,
  PaginatedProjects,
  Project,
  StoreAnalyticsResponse,
  User,
} from "@/types/api";
import type { SocialTemplatesPack } from "@/types/social-templates";

const TOKEN_KEY = "aim_discovery_token";
const USER_KEY = "aim_discovery_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * NEXT_PUBLIC_API_URL must be an absolute origin (https://host or http://host).
 * If Hostinger/env omits the scheme (e.g. "aii.atechleb.com"), fetch() treats it as a
 * relative path and the browser resolves it under the frontend origin — wrong.
 */
function normalizeApiBase(raw: string): string {
  let base = raw.trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is empty");
  }
  base = base.replace(/^\/+/, "");
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }
  try {
    const u = new URL(base);
    return `${u.protocol}//${u.host}`;
  } catch {
    throw new Error(`NEXT_PUBLIC_API_URL is not a valid URL: ${raw}`);
  }
}

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return normalizeApiBase(base);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    if (typeof p.message === "string") return p.message;
    if (p.errors && typeof p.errors === "object") {
      const errs = p.errors as Record<string, string[]>;
      const first = Object.values(errs).flat()[0];
      if (typeof first === "string") return first;
    }
  }
  return fallback;
}

async function apiFetchFormData<T>(path: string, formData: FormData): Promise<T> {
  const base = apiBase();
  const segment = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(segment, `${base}/api/`).href;
  const token = getStoredToken();
  const headers = new Headers();
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { method: "POST", headers, body: formData });
  const payload = await parseJson(res);

  if (!res.ok) {
    throw new ApiError(
      extractMessage(payload, res.statusText),
      res.status,
      payload,
    );
  }

  return payload as T;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const base = apiBase();
  const segment = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(segment, `${base}/api/`).href;
  const token = init.token ?? getStoredToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });
  const payload = await parseJson(res);

  if (!res.ok) {
    throw new ApiError(
      extractMessage(payload, res.statusText),
      res.status,
      payload,
    );
  }

  return payload as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string; password_confirmation: string }) =>
    apiFetch<AuthResponse>("/register", { method: "POST", body: JSON.stringify(body), token: null }),

  login: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/login", { method: "POST", body: JSON.stringify(body), token: null }),

  logout: () => apiFetch<{ message: string }>("/logout", { method: "POST" }),

  me: () => apiFetch<{ user: User }>("/user"),

  projects: (page = 1) =>
    apiFetch<PaginatedProjects>(`/projects?page=${page}`),

  createProject: (body: {
    name: string;
    website_url: string;
    store_platform?: "shopify" | "woocommerce";
    store_url?: string;
    store_api_key?: string;
    ai_provider?: "openai" | "gemini";
    ai_api_key?: string;
  }) =>
    apiFetch<{ data: Project }>("/projects", { method: "POST", body: JSON.stringify(body) }),

  project: (id: number) => apiFetch<{ data: Project }>(`/projects/${id}`),

  updateProject: (
    id: number,
    body: {
      name?: string;
      store_platform?: "shopify" | "woocommerce";
      store_url?: string;
      store_api_key?: string;
      ai_provider?: "openai" | "gemini";
      ai_api_key?: string;
    },
  ) =>
    apiFetch<{ data: Project }>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  deleteProject: (id: number) =>
    apiFetch<{ message: string }>(`/projects/${id}`, { method: "DELETE" }),

  regenerate: (id: number, scope: "analysis" | "content" | "crawl") =>
    apiFetch<{ message: string }>(`/projects/${id}/regenerate`, {
      method: "POST",
      body: JSON.stringify({ scope }),
    }),

  socialTemplates: (body: { url: string; item_label?: string; notes?: string }) =>
    apiFetch<{ data: SocialTemplatesPack }>("/social-templates", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Admin
  adminUsers: (page = 1) => apiFetch<{ data: AdminUserRow[]; meta?: unknown }>(`/admin/users?page=${page}`),

  adminCreateUser: (body: { name: string; email: string; password: string; is_admin?: boolean }) =>
    apiFetch<{ user: AdminUserRow }>(`/admin/users`, { method: "POST", body: JSON.stringify(body) }),

  adminDeleteUser: (id: number) => apiFetch<{ message: string }>(`/admin/users/${id}`, { method: "DELETE" }),

  adminResetUserPassword: (id: number, password: string) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  adminProjects: (page = 1, q?: string) =>
    apiFetch<{ data: Project[]; meta?: unknown }>(`/admin/projects?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ""}`),

  adminUpdateProject: (id: number, body: { name: string }) =>
    apiFetch<{ data: Project }>(`/admin/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  adminDeleteProject: (id: number) =>
    apiFetch<{ message: string }>(`/admin/projects/${id}`, { method: "DELETE" }),

  storeAnalyticsAnalyzeApi: (body: {
    module_name: string;
    platform: "shopify" | "woocommerce";
    store_url: string;
    api_key: string;
    language?: "en" | "ar";
    range_days?: number;
    max_orders?: number;
  }) =>
    apiFetch<{ data: StoreAnalyticsResponse }>("/store-analytics/analyze", {
      method: "POST",
      body: JSON.stringify({
        ...body,
        source_type: "api",
      }),
    }),

  storeAnalyticsAnalyzeProject: (
    projectId: number,
    body: {
      language?: "en" | "ar";
      range_days?: number;
      max_orders?: number;
    },
  ) =>
    apiFetch<{ data: StoreAnalyticsResponse }>(`/projects/${projectId}/store-analytics/analyze`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  storeAnalyticsAnalyzeCsv: (body: {
    module_name: string;
    platform: "shopify" | "woocommerce";
    csv_file: File;
    language?: "en" | "ar";
    range_days?: number;
    max_orders?: number;
  }) => {
    const fd = new FormData();
    fd.append("module_name", body.module_name);
    fd.append("source_type", "csv");
    fd.append("platform", body.platform);
    if (body.language) fd.append("language", body.language);
    fd.append("csv_file", body.csv_file);
    fd.append("range_days", String(body.range_days ?? 90));
    fd.append("max_orders", String(body.max_orders ?? 250));
    return apiFetchFormData<{ data: StoreAnalyticsResponse }>("/store-analytics/analyze", fd);
  },
};
