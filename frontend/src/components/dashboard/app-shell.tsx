"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, getStoredUser, setStoredToken, setStoredUser } from "@/lib/api-client";
import { NavIcon } from "@/components/ui/design-system";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [uiLang, setUiLang] = useState<"en" | "ar">(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("aim_ui_lang") === "ar" ? "ar" : "en";
  });

  useEffect(() => {
    // Fast path: use cached user so first paint doesn't wait for /user.
    const cached = getStoredUser();
    if (cached?.is_admin !== undefined) {
      setIsAdmin(Boolean(cached.is_admin));
    }
    let alive = true;
    api
      .me()
      .then((r) => {
        if (!alive) return;
        setIsAdmin(Boolean(r.user?.is_admin));
        setStoredUser(r.user);
        if (!r.user?.is_admin && r.user?.access_status === "pending_approval") {
          setAccessNotice(
            `Your free trial has ended. Send your ${r.user.selected_plan ?? "selected"} plan payment to ${r.user.payment_phone ?? "76349746"} via ${r.user.payment_methods ?? "Wish Money or OMT"}, then send the invoice on ${r.user.invoice_channel ?? "WhatsApp"}. Admin confirmation is required.`,
          );
        } else if (!r.user?.is_admin && r.user?.access_status === "trial" && r.user?.trial_ends_at) {
          setAccessNotice(
            `Free trial active until ${new Date(r.user.trial_ends_at).toLocaleString()}. After trial, send payment to ${r.user.payment_phone ?? "76349746"} and share invoice on ${r.user.invoice_channel ?? "WhatsApp"} for admin approval.`,
          );
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      alive = false;
    };
  }, []);

  function switchLanguage(next: "en" | "ar") {
    setUiLang(next);
    localStorage.setItem("aim_ui_lang", next);
    document.documentElement.lang = next;
    window.location.reload();
  }

  const nav = useMemo(
    () => [
      { href: "/dashboard", label: "Projects", icon: "projects" as const },
      { href: "/dashboard/projects/new", label: "Analyze website", icon: "analyze" as const },
      { href: "/dashboard/social-templates", label: "Social templates", icon: "templates" as const },
      { href: "/dashboard/store-analytics", label: "Store analytics", icon: "analytics" as const },
      ...(isAdmin
        ? [
            { href: "/dashboard/admin/users", label: "Admin · Users", icon: "users" as const },
            { href: "/dashboard/admin/projects", label: "Admin · Projects", icon: "adminProjects" as const },
          ]
        : []),
    ],
    [isAdmin],
  );

  async function logout() {
    try {
      await api.logout();
    } catch {
      /* still clear local session */
    }
    setStoredToken(null);
    setStoredUser(null);
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen text-zinc-900 dark:text-zinc-50">
      {accessNotice && (
        <div className="fixed bottom-4 right-4 z-40 max-w-md rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-xl dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100">
          <p>{accessNotice}</p>
          <button
            type="button"
            className="mt-2 rounded-md border border-amber-300 px-2 py-1 text-xs font-semibold hover:bg-amber-100 dark:border-amber-500/40 dark:hover:bg-amber-500/20"
            onClick={() => setAccessNotice(null)}
          >
            Close
          </button>
        </div>
      )}
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200/80 bg-white/65 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70 md:flex md:flex-col">
        <div className="flex h-16 items-center border-b border-zinc-200/80 px-6 dark:border-zinc-800">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            AI Marketing Discovery
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard" ||
                  (pathname.startsWith("/dashboard/projects/") && pathname !== "/dashboard/projects/new")
                : item.href === "/dashboard/social-templates"
                  ? pathname.startsWith("/dashboard/social-templates")
                  : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-violet-600/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
                }`}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-200/80 p-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white/70 px-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/65 md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/dashboard" className="text-sm font-semibold">
              AI Discovery
            </Link>
          </div>
          <div className="hidden text-sm text-zinc-500 dark:text-zinc-400 md:block">
            Turn any website into marketing direction.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => switchLanguage("en")}
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                uiLang === "en"
                  ? "bg-violet-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => switchLanguage("ar")}
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                uiLang === "ar"
                  ? "bg-violet-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              AR
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 md:hidden"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="animate-enter-fade flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
