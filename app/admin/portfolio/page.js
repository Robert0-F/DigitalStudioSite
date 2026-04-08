"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminTabs from "@/components/admin/AdminTabs";
import Button from "@/components/ui/Button";

function formatPublished(v) {
  return v ? "Yes" : "No";
}

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
      if (!res.ok) throw new Error(json?.error || "Failed to load projects");
      setProjects(json.projects ?? []);
    } catch (e) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const remove = async (id) => {
    const ok = window.confirm("Delete this project? This action cannot be undone.");
    if (!ok) return;

    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/portfolio/${id}/`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Deletion failed");
      await refresh();
    } catch (e) {
      setError(e?.message || "Deletion error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#050508] pt-28 pb-24">
      <div className="section-padding">
        <div className="mb-10">
          <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
            Admin
          </p>
          <h1 className="heading-md font-display font-bold text-white">Portfolio projects</h1>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Create, edit, publish/unpublish and delete portfolio projects.
          </p>
        </div>

        <AdminTabs />

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/admin/portfolio/new" className="inline-flex">
            <Button type="button">Add new project</Button>
          </Link>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>

        {loading ? (
          <p className="text-sm text-[#9ca3af]">Loading…</p>
        ) : (
          <div className="glass-strong rounded-3xl border border-white/[0.06] p-6 sm:p-8 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-[#71717a] uppercase tracking-wider">
                  <th className="pb-3 pr-3">Title</th>
                  <th className="pb-3 pr-3">Project type</th>
                  <th className="pb-3 pr-3">Published</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length ? (
                  projects.map((p) => (
                    <tr key={p.id} className="border-t border-white/[0.06]">
                      <td className="py-4 pr-3">
                        <Link
                          href={`/portfolio/${p.slug}`}
                          className="text-sm text-[#e5e7eb] hover:text-white underline underline-offset-4"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-4 pr-3 text-sm text-[#9ca3af]">{p.project_type || "-"}</td>
                      <td className="py-4 pr-3 text-sm text-[#9ca3af]">{formatPublished(p.published)}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <Link href={`/admin/portfolio/${p.id}/edit`}>
                            <Button type="button" variant="secondary">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={deletingId === p.id}
                            onClick={() => remove(p.id)}
                          >
                            {deletingId === p.id ? "Deleting…" : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-sm text-[#9ca3af]">
                      No projects yet. Add your first one.
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

