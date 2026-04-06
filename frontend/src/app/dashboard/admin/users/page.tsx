"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import type { AdminUserRow } from "@/types/api";

export default function AdminUsersPage() {
  const [meAdmin, setMeAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", is_admin: false });

  const canSubmit = useMemo(() => form.name.trim() && form.email.trim() && form.password.length >= 8, [form]);

  async function load() {
    setError(null);
    try {
      const me = await api.me();
      setMeAdmin(Boolean(me.user?.is_admin));
      const res = await api.adminUsers(1);
      setRows(res.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load users.");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createUser() {
    setBusy(true);
    setError(null);
    try {
      await api.adminCreateUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        is_admin: form.is_admin,
      });
      setForm({ name: "", email: "", password: "", is_admin: false });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create user.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(id: number) {
    const password = window.prompt("New password (min 8 chars)");
    if (!password) return;
    setBusy(true);
    setError(null);
    try {
      await api.adminResetUserPassword(id, password);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to reset password.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(id: number) {
    if (!window.confirm("Delete this user? This will delete their projects too.")) return;
    setBusy(true);
    setError(null);
    try {
      await api.adminDeleteUser(id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete user.");
    } finally {
      setBusy(false);
    }
  }

  if (meAdmin === false) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-rose-600 dark:text-rose-400">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin · Users</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Create users, reset passwords, and delete accounts.</p>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Add user</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="Password (min 8)"
            type="password"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={form.is_admin}
              onChange={(e) => setForm((f) => ({ ...f, is_admin: e.target.checked }))}
            />
            Admin
          </label>
        </div>
        <button
          type="button"
          disabled={busy || !canSubmit}
          onClick={() => void createUser()}
          className="mt-3 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Create user
        </button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 text-zinc-500">{u.id}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.is_admin ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void resetPassword(u.id)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs dark:border-zinc-700"
                    >
                      Reset password
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void deleteUser(u.id)}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-700 dark:border-rose-500/40 dark:text-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

