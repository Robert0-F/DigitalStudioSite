"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import AdminTabs from "@/components/admin/AdminTabs";
import PortfolioProjectForm from "@/components/admin/PortfolioProjectForm";
import Button from "@/components/ui/Button";
import { adminErrorMessage, parseAdminJson } from "@/lib/adminApi";
import { appendPortfolioFormData } from "@/lib/adminFormData";
import ProjectImagesManager from "@/components/admin/ProjectImagesManager";

export default function AdminPortfolioEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [initialProject, setInitialProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProject = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio", { method: "GET", credentials: "include" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Не удалось загрузить проекты");
      const list = json?.projects ?? [];
      const found = list.find((p) => String(p.id) === String(id));
      if (!found) throw new Error("Проект не найден");
      setInitialProject(found);
    } catch (e) {
      setError(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values) => {
    setError("");
    setIsSubmitting(true);
    try {
      const fd = appendPortfolioFormData(new FormData(), values);
      const res = await fetch(`/api/admin/portfolio/${id}/`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      const parsed = await parseAdminJson(res);
      if (!res.ok) {
        throw new Error(adminErrorMessage(parsed, "Не удалось сохранить", res.status));
      }
      router.push("/admin/portfolio");
    } catch (e) {
      setError(e?.message || "Ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = useMemo(() => (initialProject ? "Сохранить" : "Сохранить"), [initialProject]);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-28 pb-24">
      <div className="section-padding">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-teal">
              Админ
            </p>
            <h1 className="heading-md font-display font-bold text-ink">Редактирование</h1>
          </div>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Назад
          </Button>
        </div>

        <AdminTabs />

        {error ? <p className="mb-6 text-sm text-clay">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-ink-muted">Загрузка…</p>
        ) : initialProject ? (
          <div className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-soft sm:p-8">
            <PortfolioProjectForm
              initialValues={initialProject}
              submitLabel={submitLabel}
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
            />

            <ProjectImagesManager
              projectId={id}
              initialImages={initialProject?.images ?? []}
            />
          </div>
        ) : (
          <p className="text-sm text-ink-muted">Проект не найден.</p>
        )}
      </div>
    </main>
  );
}
