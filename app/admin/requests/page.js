"use client";

import { useEffect, useState } from "react";

import AdminTabs from "@/components/admin/AdminTabs";

function formatDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("ru-RU");
}

export default function AdminRequestsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads", { method: "GET", credentials: "include" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load requests");
      setLeads(json?.leads ?? []);
    } catch (e) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="min-h-screen bg-[#050508] pt-28 pb-24">
      <div className="section-padding">
        <div className="mb-10">
          <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
            Admin
          </p>
          <h1 className="heading-md font-display font-bold text-white">Заявки</h1>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Все заявки со всех форм сайта.
          </p>
        </div>

        <AdminTabs />

        {error ? <p className="mb-6 text-sm text-red-400">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-[#9ca3af]">Loading…</p>
        ) : (
          <div className="glass-strong overflow-auto rounded-3xl border border-white/[0.06] p-6 sm:p-8">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-[#71717a]">
                  <th className="pb-3 pr-3">Дата</th>
                  <th className="pb-3 pr-3">Имя</th>
                  <th className="pb-3 pr-3">Контакт</th>
                  <th className="pb-3 pr-3">Тип</th>
                  <th className="pb-3">Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {leads.length ? (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-white/[0.06] align-top">
                      <td className="py-4 pr-3 text-sm text-[#9ca3af]">{formatDate(lead.created_at)}</td>
                      <td className="py-4 pr-3 text-sm text-[#e5e7eb]">{lead.name || "-"}</td>
                      <td className="py-4 pr-3 text-sm text-[#e5e7eb]">{lead.contact || "-"}</td>
                      <td className="py-4 pr-3 text-sm text-[#9ca3af]">{lead.project_type || "-"}</td>
                      <td className="py-4 text-sm text-[#9ca3af] whitespace-pre-line">
                        {lead.description || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-sm text-[#9ca3af]">
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
