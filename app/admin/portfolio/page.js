"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminTabs from "@/components/admin/AdminTabs";
import Button from "@/components/ui/Button";
import { adminErrorMessage, parseAdminJson } from "@/lib/adminApi";

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio", { method: "GET", credentials: "include" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Не удалось загрузить проекты");
      setProjects(json.projects ?? []);
    } catch (e) {
      setError(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const remove = async (id) => {
    const ok = window.confirm("Удалить проект? Действие необратимо.");
    if (!ok) return;

    setDeletingId(id);
    setError("");
    try {
      const urls = [`/api/admin/portfolio/${id}/`, `/api/admin/portfolio/${id}`];
      let lastError = "Удаление не удалось";
      for (const url of urls) {
        const res = await fetch(url, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          await refresh();
          return;
        }
        const parsed = await parseAdminJson(res);
        lastError = adminErrorMessage(parsed, "Удаление не удалось", res.status);
        if (res.status === 404) continue;
        break;
      }
      throw new Error(lastError);
    } catch (e) {
      setError(e?.message || "Ошибка удаления");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-28 pb-24">
      <div className="section-padding">
        <div className="mb-10">
          <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-teal">
            Админ
          </p>
          <h1 className="heading-md font-display font-bold text-ink">Кейсы портфолио</h1>
          <p className="mt-3 text-sm text-ink-muted">Создание, редактирование, публикация и удаление.</p>
        </div>

        <AdminTabs />

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/admin/portfolio/new" className="inline-flex">
            <Button type="button">Добавить проект</Button>
          </Link>
          {error ? <p className="text-sm text-clay">{error}</p> : null}
        </div>

        {loading ? (
          <p className="text-sm text-ink-muted">Загрузка…</p>
        ) : (
          <div className="overflow-auto rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-soft sm:p-8">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-ink-muted">
                  <th className="pb-3 pr-3">Название</th>
                  <th className="pb-3 pr-3">Тип</th>
                  <th className="pb-3 pr-3">Главная</th>
                  <th className="pb-3 pr-3">Опубликован</th>
                  <th className="pb-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {projects.length ? (
                  projects.map((p) => (
                    <tr key={p.id} className="border-t border-[var(--border-soft)]">
                      <td className="py-4 pr-3">
                        <Link
                          href={`/portfolio/${p.slug}`}
                          className="text-sm text-ink underline underline-offset-4 hover:text-teal"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-4 pr-3 text-sm text-ink-muted">{p.project_type || "—"}</td>
                      <td className="py-4 pr-3 text-sm text-ink-muted">{p.show_on_home ? "Да" : "Нет"}</td>
                      <td className="py-4 pr-3 text-sm text-ink-muted">{p.published ? "Да" : "Нет"}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <Link href={`/admin/portfolio/${p.id}/edit`}>
                            <Button type="button" variant="secondary">
                              Изменить
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={deletingId === p.id}
                            onClick={() => remove(p.id)}
                          >
                            {deletingId === p.id ? "Удаление…" : "Удалить"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-sm text-ink-muted">
                      Проектов пока нет. Добавьте первый.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
