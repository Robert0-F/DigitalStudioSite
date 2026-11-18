"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import Button from "@/components/ui/Button";

const projectTypeOptions = [
  { value: "websites", label: "Сайты" },
  { value: "landing", label: "Лендинги" },
  { value: "ecommerce", label: "Интернет-магазины" },
  { value: "crm", label: "CRM / системы" },
  { value: "bot", label: "Telegram-боты" },
  { value: "marketing", label: "Маркетинг" },
];

const servicePageOptions = [
  { value: "tilda", label: "Tilda" },
  { value: "django", label: "Django" },
  { value: "telegram", label: "Telegram" },
  { value: "marketing", label: "Маркетинг" },
];

const homeFilterOptions = [
  { value: "", label: "Не показывать в фильтрах главной" },
  { value: "tilda", label: "Tilda" },
  { value: "django", label: "Django" },
  { value: "telegram", label: "Telegram" },
  { value: "marketing", label: "Маркетинг" },
];

const fieldClass = "field-input";
const labelClass = "mb-2 block text-sm font-display font-semibold text-ink";

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
      show_on_home: true,
      sort_order: 0,
      live_url: "",
      video_url: "",
      service_pages: [],
      category_slugs: [],
      home_filter: "",
      overview: "",
      problem: "",
      solution: "",
      process: "",
      results: "",
      technologies: "",
      final: "",
      heroImageFile: null,
      caseHeroImageFile: null,
      clear_case_hero: false,
    },
  });

  useEffect(() => {
    const cats = Array.isArray(initialValues?.categories)
      ? initialValues.categories.map((c) => c.slug || c).filter(Boolean)
      : Array.isArray(initialValues?.category_slugs)
        ? initialValues.category_slugs
        : [];
    const pages = Array.isArray(initialValues?.service_pages) ? initialValues.service_pages : [];

    reset({
      title: initialValues?.title ?? "",
      subtitle: initialValues?.subtitle ?? "",
      client_industry: initialValues?.client_industry ?? "",
      project_type: initialValues?.project_type ?? "landing",
      slug: initialValues?.slug ?? "",
      published: initialValues?.published ?? true,
      show_on_home: initialValues?.show_on_home ?? true,
      sort_order: initialValues?.sort_order ?? 0,
      live_url: initialValues?.live_url ?? "",
      video_url: initialValues?.video_url ?? "",
      service_pages: pages.length ? pages : cats,
      category_slugs: cats.length ? cats : pages,
      home_filter: initialValues?.home_filter ?? "",
      overview: initialValues?.overview ?? "",
      problem: initialValues?.problem ?? "",
      solution: initialValues?.solution ?? "",
      process: initialValues?.process ?? "",
      results: initialValues?.results ?? "",
      technologies: initialValues?.technologies ?? "",
      final: initialValues?.final ?? "",
      heroImageFile: null,
      caseHeroImageFile: null,
      clear_case_hero: false,
    });
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div>
        <label className={labelClass}>Заголовок</label>
        <input
          className={fieldClass}
          placeholder="Например: Банкетный зал «Сююмбике»"
          {...register("title", { required: "Укажите заголовок" })}
        />
        {errors.title ? <p className="mt-2 text-sm text-clay">{errors.title.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Подзаголовок</label>
          <input className={fieldClass} placeholder="Необязательно" {...register("subtitle")} />
        </div>
        <div>
          <label className={labelClass}>Индустрия клиента</label>
          <input className={fieldClass} placeholder="События, ритейл…" {...register("client_industry")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Тип проекта</label>
          <select className={fieldClass} {...register("project_type")}>
            {projectTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Slug (латиница)</label>
          <input className={fieldClass} placeholder="suyumbike-banquet" {...register("slug")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-wrap items-end gap-4 pb-1">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" {...register("published")} />
            Опубликовано
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" {...register("show_on_home")} />
            На главной
          </label>
        </div>
        <div>
          <label className={labelClass}>Порядок сортировки</label>
          <input type="number" className={fieldClass} {...register("sort_order")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Ссылка на сайт</label>
          <input className={fieldClass} placeholder="https://…" {...register("live_url")} />
        </div>
        <div>
          <label className={labelClass}>Видео / демо URL</label>
          <input className={fieldClass} placeholder="https://…" {...register("video_url")} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Услуги / категории</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {servicePageOptions.map((o) => (
            <label
              key={o.value}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-cream-50 px-4 py-3 text-sm text-ink"
            >
              <input type="checkbox" value={o.value} {...register("service_pages")} />
              {o.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Используется на страницах услуг, в фильтрах и как категории кейса.
        </p>
      </div>

      <div>
        <label className={labelClass}>Фильтр на главной</label>
        <select className={fieldClass} {...register("home_filter")}>
          {homeFilterOptions.map((o) => (
            <option key={o.value || "none"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4 rounded-[16px] border border-[var(--border-soft)] bg-cream-50 p-4 sm:p-5">
        <div>
          <label className={labelClass}>Обложка для карточки (главная / список)</label>
          <p className="mb-2 text-xs text-ink-muted">Квадрат / превью в портфолио на главной и в списке работ.</p>
          {initialValues?.hero_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={initialValues.hero_image_url}
              alt="Текущая обложка карточки"
              className="mb-3 h-28 w-auto max-w-full rounded-lg border border-[var(--border-soft)] object-cover"
            />
          ) : null}
          <input type="file" accept="image/*" {...register("heroImageFile")} className="w-full text-sm text-ink-muted" />
        </div>

        <div className="border-t border-[var(--border-soft)] pt-4">
          <label className={labelClass}>Обложка страницы кейса (большой баннер)</label>
          <p className="mb-2 text-xs text-ink-muted">
            Широкое изображение сверху на странице кейса. Если не загрузить — подставится обложка карточки.
          </p>
          {initialValues?.case_hero_image_url &&
          initialValues.case_hero_image_url !== initialValues.hero_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={initialValues.case_hero_image_url}
              alt="Текущий баннер кейса"
              className="mb-3 h-28 w-full max-w-xl rounded-lg border border-[var(--border-soft)] object-cover"
            />
          ) : initialValues?.case_hero_image_url ? (
            <p className="mb-2 text-xs text-ink-muted">Сейчас показывается обложка карточки (отдельный баннер ещё не задан).</p>
          ) : null}
          <input type="file" accept="image/*" {...register("caseHeroImageFile")} className="w-full text-sm text-ink-muted" />
          {initialValues?.case_hero_image_url &&
          initialValues.case_hero_image_url !== initialValues.hero_image_url ? (
            <label className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
              <input type="checkbox" {...register("clear_case_hero")} />
              Сбросить баннер кейса (вернуться к обложке карточки)
            </label>
          ) : null}
        </div>
      </div>

      {[
        ["overview", "О проекте / задача"],
        ["problem", "Проблема"],
        ["solution", "Что сделал"],
        ["process", "Процесс"],
        ["results", "Результат"],
        ["technologies", "Стек / технологии"],
        ["final", "Итог"],
      ].map(([name, label]) => (
        <div key={name}>
          <label className={labelClass}>{label}</label>
          <textarea rows={4} className={`${fieldClass} min-h-[120px] resize-y`} {...register(name)} />
        </div>
      ))}

      <Button type="submit" disabled={isSubmitting} className="w-full min-w-[220px] sm:w-auto">
        {isSubmitting ? "Сохранение…" : submitLabel}
      </Button>
    </form>
  );
}
