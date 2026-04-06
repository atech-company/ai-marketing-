"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, getStoredUser, setStoredToken, setStoredUser } from "@/lib/api-client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

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
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      alive = false;
    };
  }, []);

  const nav = useMemo(
    () => [
      { href: "/dashboard", label: "Projects" },
      { href: "/dashboard/projects/new", label: "New analysis" },
      { href: "/dashboard/social-templates", label: "Social templates" },
      ...(isAdmin ? [{ href: "/dashboard/admin/users", label: "Admin · Users" }, { href: "/dashboard/admin/projects", label: "Admin · Projects" }] : []),
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
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 md:flex md:flex-col">
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
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-violet-600/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
                }`}
              >
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
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/dashboard" className="text-sm font-semibold">
              AI Discovery
            </Link>
          </div>
          <div className="hidden text-sm text-zinc-500 dark:text-zinc-400 md:block">
            Turn any website into marketing direction.
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 md:hidden"
          >
            Log out
          </button>
        </header>
        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
