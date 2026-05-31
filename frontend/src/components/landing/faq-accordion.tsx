"use client";

import { useState } from "react";

type FaqItem = { q: string; a: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <dl className="mt-10 space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.q}
            className={`overflow-hidden rounded-2xl border transition-[border-color,box-shadow,background] duration-200 ${
              isOpen
                ? "border-violet-300/80 bg-white shadow-md shadow-violet-500/10 dark:border-violet-500/40 dark:bg-zinc-900/80"
                : "border-zinc-200/80 bg-white/70 hover:border-violet-200 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-violet-500/30"
            }`}
          >
            <dt>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="font-semibold">{item.q}</span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-violet-600 transition-transform duration-200 dark:text-violet-400 ${
                    isOpen ? "rotate-180 bg-violet-100 dark:bg-violet-500/20" : "bg-zinc-100 dark:bg-zinc-800"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </dt>
            <dd
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.a}</p>
              </div>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
