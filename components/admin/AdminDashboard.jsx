"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { categoryLabels } from "@/lib/data";
import { Loader2, Trash2 } from "lucide-react";

const categories = Object.keys(categoryLabels);

function projectToForm(p) {
  return {
    id: p.id,
    title: p.title ?? "",
    description: p.description ?? "",
    category: p.category ?? categories[0],
    image_url: p.image_url ?? "",
    detailed_page: !!p.detailed_page,
    published: !!p.published,
    imageFile: null,
  };
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const initialForm = useMemo(
    () => ({
      id: null,
      title: "",
      description: "",
      category: categories[0] ?? "web",
      image_url: "",
      detailed_page: false,
      published: true,
      imageFile: null,
    }),
    []
  );

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio", { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Не удалось загрузить проекты");
      }
      const json = await res.json();
      setProjects(json.projects ?? []);
    } catch (e) {
      setError(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("detailed_page", form.detailed_page ? "true" : "false");
      fd.append("published", form.published ? "true" : "false");
      fd.append("image_url", form.image_url);
      if (form.imageFile) fd.append("imageFile", form.imageFile);

      const url = form.id
        ? `/api/admin/portfolio/${form.id}/`
        : "/api/admin/portfolio";
      const method = form.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: fd,
        credentials: "include",
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error || "Ошибка сохранения");
      }

      setForm(initialForm);
      await refresh();
    } catch (e) {
      setSaveError(e?.message || "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p) => {
    setForm(projectToForm(p));
    setSaveError("");
  };

  const remove = async (id) => {
    const ok = window.confirm("Удалить проект? Это действие нельзя отменить.");
    if (!ok) return;
    setSaveError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/portfolio/${id}/`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Удаление не удалось");
      setForm(initialForm);
      await refresh();
    } catch (e) {
      setSaveError(e?.message || "Ошибка удаления");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
            Управление портфолио
          </p>
          <h1 className="heading-md font-display font-bold text-white">
            Проекты студии
          </h1>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Добавляйте/редактируйте проекты: заголовок, описание, категория,
            изображение и настройки видимости.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <form
              onSubmit={submit}
              className="glass-strong rounded-3xl border border-white/[0.06] p-6 sm:p-8"
              noValidate
            >
              <p className="mb-2 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
                {form.id ? "Редактирование" : "Новый проект"}
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-display font-semibold text-white mb-2">
                    Заголовок
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, title: e.target.value }))
                    }
                    className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                    placeholder="Например: Nexus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-display font-semibold text-white mb-2">
                    Описание
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, description: e.target.value }))
                    }
                    className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors resize-y min-h-[120px]"
                    placeholder="Что было сделано, какие задачи решили…"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-display font-semibold text-white mb-2">
                      Категория
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, category: e.target.value }))
                      }
                      className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {categoryLabels[c]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-3">
                    <label className="flex items-center gap-2 text-sm text-[#d4d4d8]">
                      <input
                        type="checkbox"
                        checked={form.detailed_page}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            detailed_page: e.target.checked,
                          }))
                        }
                      />
                      Детальная страница
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-[#d4d4d8]">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, published: e.target.checked }))
                      }
                    />
                    Опубликовано
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-display font-semibold text-white mb-2">
                    Image URL (опционально)
                  </label>
                  <input
                    value={form.image_url}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, image_url: e.target.value }))
                    }
                    className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                    placeholder="https://…"
                  />
                </div>

                <div>
                  <label className="block text-sm font-display font-semibold text-white mb-2">
                    Загрузить изображение (опционально)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setForm((s) => ({ ...s, imageFile: file }));
                    }}
                    className="w-full text-sm text-[#9ca3af]"
                  />
                </div>

                {saveError ? (
                  <p className="text-sm text-red-400" role="alert">
                    {saveError}
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="sm:w-auto w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        Сохраняем…
                      </>
                    ) : form.id ? (
                      "Сохранить изменения"
                    ) : (
                      "Добавить проект"
                    )}
                  </Button>
                  {form.id ? (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={saving}
                      className="sm:w-auto w-full"
                      onClick={() => setForm(initialForm)}
                    >
                      Очистить
                    </Button>
                  ) : null}
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-strong rounded-3xl border border-white/[0.06] p-6 sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-sm font-display font-semibold text-white">
                  Список проектов
                </p>
                <Button type="button" variant="secondary" onClick={refresh} disabled={loading}>
                  Обновить
                </Button>
              </div>

              {error ? (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              ) : null}

              {loading ? (
                <p className="text-sm text-[#9ca3af]">Загрузка…</p>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-[#71717a] uppercase tracking-wider">
                        <th className="pb-3 pr-3">Заголовок</th>
                        <th className="pb-3 pr-3">Категория</th>
                        <th className="pb-3 pr-3">Опубликовано</th>
                        <th className="pb-3 pr-3">Детально</th>
                        <th className="pb-3 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.length ? (
                        projects.map((p) => (
                          <tr key={p.id} className="border-t border-white/[0.06]">
                            <td className="py-4 pr-3">
                              <button
                                type="button"
                                className="text-sm text-[#e5e7eb] hover:text-white underline underline-offset-4"
                                onClick={() => startEdit(p)}
                              >
                                {p.title}
                              </button>
                            </td>
                            <td className="py-4 pr-3 text-sm text-[#9ca3af]">
                              {categoryLabels[p.category] || p.category}
                            </td>
                            <td className="py-4 pr-3 text-sm text-[#9ca3af]">
                              {p.published ? "Да" : "Нет"}
                            </td>
                            <td className="py-4 pr-3 text-sm text-[#9ca3af]">
                              {p.detailed_page ? "Да" : "Нет"}
                            </td>
                            <td className="py-4 text-right">
                              <button
                                type="button"
                                disabled={saving}
                                className="inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-2 text-sm text-[#9ca3af] transition-colors hover:border-[#6366f1]/30 hover:text-white"
                                onClick={() => remove(p.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" aria-hidden />
                                Удалить
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-sm text-[#9ca3af]">
                            Нет проектов — добавьте первый слева.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {form.id || projects.length ? (
          <p className="mt-6 text-xs text-[#71717a]">
            Подсказка: после добавления проекта с флагом «Детальная страница»
            он станет открываться по клику на карточке.
          </p>
        ) : null}
      </div>
    </div>
  );
}

