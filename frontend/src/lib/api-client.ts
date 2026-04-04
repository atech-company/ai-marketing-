import type {
  AuthResponse,
  PaginatedProjects,
  Project,
  User,
} from "@/types/api";
import type { SocialTemplatesPack } from "@/types/social-templates";

const TOKEN_KEY = "aim_discovery_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return base.replace(/\/$/, "");
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

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const url = `${apiBase()}/api${path.startsWith("/") ? path : `/${path}`}`;
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

  createProject: (body: { name: string; website_url: string }) =>
    apiFetch<{ data: Project }>("/projects", { method: "POST", body: JSON.stringify(body) }),

  project: (id: number) => apiFetch<{ data: Project }>(`/projects/${id}`),

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
};
