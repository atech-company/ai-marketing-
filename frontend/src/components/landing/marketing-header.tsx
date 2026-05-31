"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/brand";

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 transition-[box-shadow,background,border-color] duration-300 ${
        scrolled
          ? "border-b border-zinc-200/80 bg-white/90 shadow-sm shadow-violet-500/5 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/90"
          : "border-b border-transparent bg-white/60 backdrop-blur-lg dark:bg-zinc-950/60"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-sm font-bold text-white shadow-md shadow-violet-500/30">
            FK
          </span>
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-600 md:flex dark:text-zinc-400">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-violet-600 dark:hover:text-violet-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 text-sm md:flex">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Log in
          </Link>
          <Link href="/register" className="ds-btn ds-btn-primary px-4 py-2">
            Get started
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 text-zinc-700 md:hidden dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-zinc-200/80 bg-white/95 px-6 py-4 md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-violet-50 hover:text-violet-700 dark:text-zinc-200 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Link
              href="/login"
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-center text-sm font-medium dark:border-zinc-700"
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="ds-btn ds-btn-primary w-full py-2.5"
              onClick={() => setMenuOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
