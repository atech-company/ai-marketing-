import { RequireAuth } from "@/components/auth/require-auth";
import { AppShell } from "@/components/dashboard/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
