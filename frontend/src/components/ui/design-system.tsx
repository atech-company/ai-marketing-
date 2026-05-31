type IconName =
  | "projects"
  | "analyze"
  | "templates"
  | "analytics"
  | "settings"
  | "users"
  | "adminProjects"
  | "revenue"
  | "orders"
  | "customers"
  | "growth";

const iconPaths: Record<IconName, string> = {
  projects: "M3 7h18M3 12h18M3 17h18",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zm8-3a8 8 0 11-16 0 8 8 0 0116 0z",
  analyze: "M4 6h16M4 12h10M4 18h16M16 10l4 4-4 4",
  templates: "M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm3 4h8m-8 4h8m-8 4h5",
  analytics: "M4 18h16M7 14v-4m5 8V6m5 12v-7",
  users: "M16 19v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1m15-8a3 3 0 11-6 0 3 3 0 016 0zM9 9a3 3 0 11-6 0 3 3 0 016 0z",
  adminProjects: "M4 5h8v6H4zM12 13h8v6h-8zM4 13h6v6H4zM14 5h6v6h-6z",
  revenue: "M4 16l4-4 3 3 5-7",
  orders: "M4 6h16M6 10h12M8 14h8M10 18h4",
  customers: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0",
  growth: "M4 16l5-5 3 3 6-8M16 6h5v5",
};

export function NavIcon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d={iconPaths[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatCard({
  title,
  value,
  icon,
  accent = "from-violet-500/20 to-indigo-500/20",
}: {
  title: string;
  value: string;
  icon: IconName;
  accent?: string;
}) {
  return (
    <div className={`group ds-surface animate-enter-fade overflow-hidden p-4 transition hover:-translate-y-0.5 ${accent}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
        </div>
        <span className="rounded-xl border border-violet-200 bg-violet-50 p-2 text-violet-700 transition group-hover:scale-105 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
          <NavIcon name={icon} className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
