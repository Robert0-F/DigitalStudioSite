"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import AdminTabs from "@/components/admin/AdminTabs";
import PortfolioProjectForm from "@/components/admin/PortfolioProjectForm";
import Button from "@/components/ui/Button";

export default function AdminPortfolioNewPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setError("");
    setIsSubmitting(true);

    try {
      const fd = new FormData();

      fd.append("title", values.title);
      if (values.slug) fd.append("slug", values.slug);
      if (values.subtitle) fd.append("subtitle", values.subtitle);
      if (values.client_industry) fd.append("client_industry", values.client_industry);
      if (values.project_type) fd.append("project_type", values.project_type);
      if (values.live_url) fd.append("live_url", values.live_url);
      fd.append("published", values.published ? "true" : "false");
      for (const s of values.service_pages || []) {
        fd.append("service_pages", s);
      }

      fd.append("overview", values.overview || "");
      fd.append("problem", values.problem || "");
      fd.append("solution", values.solution || "");
      fd.append("process", values.process || "");
      fd.append("results", values.results || "");
      fd.append("technologies", values.technologies || "");
      fd.append("final", values.final || "");

      const heroFile = values.heroImageFile?.[0] ?? null;
      if (heroFile) fd.append("heroImageFile", heroFile);

      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const raw = await res.text().catch(() => "");
      let json = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }
      if (!res.ok) {
        throw new Error(json?.error || raw || `Save failed (${res.status})`);
      }
      const projectId = json?.project?.id;
      if (!projectId) throw new Error("Project id missing in response");
      router.push(`/admin/portfolio/${projectId}/edit`);
    } catch (e) {
      setError(e?.message || "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050508] pt-28 pb-24">
      <div className="section-padding">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
              Admin
            </p>
            <h1 className="heading-md font-display font-bold text-white">Create project</h1>
            <p className="mt-3 text-sm text-[#9ca3af]">
              Fill the case fields. Images section comes later (next step).
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <AdminTabs />

        {error ? <p className="text-sm text-red-400 mb-6">{error}</p> : null}

        <div className="glass-strong rounded-3xl border border-white/[0.06] p-6 sm:p-8">
          <PortfolioProjectForm
            initialValues={null}
            submitLabel="Create"
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </main>
  );
}

