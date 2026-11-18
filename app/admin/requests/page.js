"use client";

import { useEffect, useState } from "react";

import AdminTabs from "@/components/admin/AdminTabs";

const STATUS_OPTIONS = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "closed", label: "Закрыта" },
];

function formatDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("ru-RU");
}

function statusLabel(status) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label || status || "—";
}

export default function AdminRequestsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads", { method: "GET", credentials: "include" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Не удалось загрузить заявки");
      setLeads(json?.leads ?? []);
    } catch (e) {
      setError(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/leads/${id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Не удалось обновить статус");
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, ...(json?.lead || { status }) } : lead))
      );
    } catch (e) {
      setError(e?.message || "Ошибка обновления");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-28 pb-24">
      <div className="section-padding">
        <div className="mb-10">
          <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-teal">
            Админ
          </p>
          <h1 className="heading-md font-display font-bold text-ink">Заявки</h1>
          <p className="mt-3 text-sm text-ink-muted">Все заявки с форм сайта. Статусы: новая / в работе / закрыта.</p>
        </div>

        <AdminTabs />

        {error ? <p className="mb-6 text-sm text-clay">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-ink-muted">Загрузка…</p>
        ) : (
          <div className="overflow-auto rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-soft sm:p-8">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-ink-muted">
                  <th className="pb-3 pr-3">Дата</th>
                  <th className="pb-3 pr-3">Имя</th>
                  <th className="pb-3 pr-3">Контакт</th>
                  <th className="pb-3 pr-3">Тип</th>
                  <th className="pb-3 pr-3">Статус</th>
                  <th className="pb-3">Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {leads.length ? (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-[var(--border-soft)] align-top">
                      <td className="py-4 pr-3 text-sm text-ink-muted">{formatDate(lead.created_at)}</td>
                      <td className="py-4 pr-3 text-sm text-ink">{lead.name || "—"}</td>
                      <td className="py-4 pr-3 text-sm text-ink">{lead.contact || "—"}</td>
                      <td className="py-4 pr-3 text-sm text-ink-muted">{lead.project_type || "—"}</td>
                      <td className="py-4 pr-3 text-sm">
                        <select
                          className="field-input min-w-[140px] py-2"
                          value={lead.status || "new"}
                          disabled={updatingId === lead.id}
                          aria-label={`Статус заявки ${statusLabel(lead.status)}`}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="whitespace-pre-line py-4 text-sm text-ink-muted">
                        {lead.description || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-sm text-ink-muted">
                      Заявок пока нет.
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
