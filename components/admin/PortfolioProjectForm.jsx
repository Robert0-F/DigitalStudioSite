"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import Button from "@/components/ui/Button";

const projectTypeOptions = [
  { value: "websites", label: "Сайты" },
  { value: "landing", label: "Лендинги" },
  { value: "ecommerce", label: "Интернет-магазины" },
  { value: "crm", label: "CRM-системы" },
  { value: "digital_product", label: "Дизайн" },
  { value: "branding", label: "Брендинг" },
];

const servicePageOptions = [
  { value: "web", label: "Веб и платформы" },
  { value: "crm", label: "CRM и автоматизация" },
  { value: "ui-ux", label: "UI/UX дизайн" },
  { value: "brand", label: "Бренд и айдентика" },
];

export default function PortfolioProjectForm({
  initialValues,
  submitLabel,
  onSubmit,
  isSubmitting,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
      client_industry: "",
      project_type: "landing",
      slug: "",
      published: true,
      live_url: "",
      service_pages: [],

      overview: "",
      problem: "",
      solution: "",
      process: "",
      results: "",
      technologies: "",
      final: "",

      heroImageFile: null,
    },
  });

  useEffect(() => {
    reset({
      title: initialValues?.title ?? "",
      subtitle: initialValues?.subtitle ?? "",
      client_industry: initialValues?.client_industry ?? "",
      project_type: initialValues?.project_type ?? "landing",
      slug: initialValues?.slug ?? "",
      published: initialValues?.published ?? true,
      live_url: initialValues?.live_url ?? "",
      service_pages: Array.isArray(initialValues?.service_pages) ? initialValues.service_pages : [],

      overview: initialValues?.overview ?? "",
      problem: initialValues?.problem ?? "",
      solution: initialValues?.solution ?? "",
      process: initialValues?.process ?? "",
      results: initialValues?.results ?? "",
      technologies: initialValues?.technologies ?? "",
      final: initialValues?.final ?? "",

      heroImageFile: null,
    });
  }, [initialValues, reset]);

  const submit = (values) => onSubmit(values);

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <label className="block text-sm font-display font-semibold text-white">
          Заголовок (title)
        </label>
        <input
          className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
          placeholder="Например: Банкетный зал «Сююмбике»"
          {...register("title", { required: "Укажите заголовок" })}
        />
        {errors.title ? (
          <p className="text-sm text-red-400">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-display font-semibold text-white">
            Короткий подзаголовок
          </label>
          <input
            className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
            placeholder="Необязательно"
            {...register("subtitle")}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-display font-semibold text-white">
            Индустрия клиента
          </label>
          <input
            className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
            placeholder="Например: Событийная индустрия"
            {...register("client_industry")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-display font-semibold text-white">
            Тип проекта
          </label>
          <select
            className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
            {...register("project_type")}
          >
            {projectTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-display font-semibold text-white">
            Slug (опционально, латиница)
          </label>
          <input
            className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
            placeholder="Сююмбике-банкетный-зал"
            {...register("slug")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 text-sm text-[#d4d4d8]">
            <input type="checkbox" {...register("published")} />
            Опубликовано
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-display font-semibold text-white">
            Ссылка на сайт (live_url, опционально)
          </label>
          <input
            className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
            placeholder="https://..."
            {...register("live_url")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-display font-semibold text-white">
          Показывать на страницах услуг (опционально)
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {servicePageOptions.map((o) => (
            <label key={o.value} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#d4d4d8]">
              <input
                type="checkbox"
                value={o.value}
                {...register("service_pages")}
              />
              {o.label}
            </label>
          ))}
        </div>
        <p className="text-xs text-[#71717a]">
          Эти категории используются на страницах услуг и в фильтрах кейсов на главной.
          Если ничего не выбрано — кейс будет только в общем портфолио.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-display font-semibold text-white">
          Обложка (hero image)
        </label>
        <input
          type="file"
          accept="image/*"
          {...register("heroImageFile")}
          className="w-full text-sm text-[#9ca3af]"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-display font-semibold text-white">
          🧠 О проекте (overview)
        </label>
        <textarea
          rows={4}
          className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors resize-y min-h-[120px]"
          {...register("overview")}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-display font-semibold text-white">
          ⚠️ Проблема (problem)
        </label>
        <textarea
          rows={4}
          className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors resize-y min-h-[120px]"
          {...register("problem")}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-display font-semibold text-white">
          🛠 Решение (solution)
        </label>
        <textarea
          rows={4}
          className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors resize-y min-h-[120px]"
          {...register("solution")}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-display font-semibold text-white">
          ⚙️ Процесс работы (process)
        </label>
        <textarea
          rows={4}
          className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors resize-y min-h-[120px]"
          {...register("process")}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-display font-semibold text-white">
          📈 Результат (results)
        </label>
        <textarea
          rows={4}
          className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors resize-y min-h-[120px]"
          {...register("results")}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-display font-semibold text-white">
          🧩 Технологии (technologies)
        </label>
        <textarea
          rows={4}
          className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors resize-y min-h-[120px]"
          {...register("technologies")}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-display font-semibold text-white">
          🔥 Итог (final)
        </label>
        <textarea
          rows={4}
          className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors resize-y min-h-[120px] min-h-[120px]"
          {...register("final")}
        />
      </div>

      <div>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto min-w-[220px]">
          {isSubmitting ? "Сохранение..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

