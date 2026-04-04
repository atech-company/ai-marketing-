import type { ProjectStatus } from "@/types/api";

const styles: Record<ProjectStatus, string> = {
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100",
  crawling: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100",
  analyzing: "bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-100",
  completed: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100",
  failed: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-100",
};

const labels: Record<ProjectStatus, string> = {
  pending: "Pending",
  crawling: "Crawling",
  analyzing: "Analyzing",
  completed: "Completed",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
