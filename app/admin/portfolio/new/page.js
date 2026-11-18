"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import AdminTabs from "@/components/admin/AdminTabs";
import PortfolioProjectForm from "@/components/admin/PortfolioProjectForm";
import Button from "@/components/ui/Button";
import { adminErrorMessage, parseAdminJson } from "@/lib/adminApi";
import { appendPortfolioFormData } from "@/lib/adminFormData";

export default function AdminPortfolioNewPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setError("");
    setIsSubmitting(true);

    try {
      const fd = appendPortfolioFormData(new FormData(), values);
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const parsed = await parseAdminJson(res);
      if (!res.ok) {
        throw new Error(adminErrorMessage(parsed, "Не удалось сохранить", res.status));
      }
      const projectId = parsed.data?.project?.id;
      if (!projectId) throw new Error("В ответе нет id проекта");
      router.push(`/admin/portfolio/${projectId}/edit`);
    } catch (e) {
      setError(e?.message || "Ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-28 pb-24">
      <div className="section-padding">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-teal">
              Админ
            </p>
            <h1 className="heading-md font-display font-bold text-ink">Новый проект</h1>
            <p className="mt-3 text-sm text-ink-muted">Галерею можно добавить после создания.</p>
          </div>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Назад
          </Button>
        </div>

        <AdminTabs />

        {error ? <p className="mb-6 text-sm text-clay">{error}</p> : null}

        <div className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-soft sm:p-8">
          <PortfolioProjectForm
            initialValues={null}
            submitLabel="Создать"
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </main>
  );
}
