"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import AdminTabs from "@/components/admin/AdminTabs";
import Button from "@/components/ui/Button";
import { adminErrorMessage, parseAdminJson } from "@/lib/adminApi";
import { services as defaultServices, servicesSection as defaultServicesSection } from "@/lib/siteContent";

const emptyReview = () => ({ id: "", text: "", author: "", role: "" });

const defaultServiceCards = () =>
  defaultServices.map((s) => ({
    id: s.id,
    title: s.title,
    outcome: s.outcome,
    forWhom: s.forWhom,
  }));

const SERVICE_LABELS = {
  tilda: "Tilda",
  django: "Веб-системы",
  agents: "ИИ-агенты",
  marketing: "Яндекс",
  telegram: "Telegram",
};

export default function AdminSiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_primary_cta: "",
    hero_secondary_cta: "",
    hero_browser_label: "",
    hero_browser_url: "",
    trust_years_value: "",
    trust_years_label: "",
    trust_projects_value: "",
    trust_projects_label: "",
    trust_stack_value: "",
    trust_stack_label: "",
    services_heading: defaultServicesSection.heading,
    services_subtitle: defaultServicesSection.subtitle,
    services_cards: defaultServiceCards(),
    price_tilda: "",
    price_django: "",
    price_agents: "",
    price_telegram: "",
    price_marketing: "",
    price_start: "",
    price_growth: "",
    price_system: "",
    footer_legal: "",
    reviews: [emptyReview(), emptyReview(), emptyReview()],
  });
  const [previews, setPreviews] = useState({
    desktop: null,
    mobile: null,
    logo: null,
  });
  const [files, setFiles] = useState({
    desktop: null,
    mobile: null,
    logo: null,
  });
  const [clearFlags, setClearFlags] = useState({
    desktop: false,
    mobile: false,
    logo: false,
  });

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-settings", { credentials: "include" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Не удалось загрузить настройки");
      const s = json?.settings || {};
      const reviews = Array.isArray(s.reviews) ? s.reviews.slice(0, 3) : [];
      while (reviews.length < 3) reviews.push(emptyReview());
      const savedCards = Array.isArray(s.services_cards) ? s.services_cards : [];
      const cardsById = new Map(savedCards.filter((c) => c?.id).map((c) => [c.id, c]));
      const services_cards = defaultServices.map((svc) => {
        const over = cardsById.get(svc.id) || {};
        return {
          id: svc.id,
          title: over.title || svc.title,
          outcome: over.outcome || svc.outcome,
          forWhom: over.forWhom || over.for_whom || svc.forWhom,
        };
      });
      setForm({
        hero_title: s.hero_title || "",
        hero_subtitle: s.hero_subtitle || "",
        hero_primary_cta: s.hero_primary_cta || "",
        hero_secondary_cta: s.hero_secondary_cta || "",
        hero_browser_label: s.hero_browser_label || "",
        hero_browser_url: s.hero_browser_url || "",
        trust_years_value: s.trust_years_value || "",
        trust_years_label: s.trust_years_label || "",
        trust_projects_value: s.trust_projects_value || "",
        trust_projects_label: s.trust_projects_label || "",
        trust_stack_value: s.trust_stack_value || "",
        trust_stack_label: s.trust_stack_label || "",
        services_heading: s.services_heading || defaultServicesSection.heading,
        services_subtitle: s.services_subtitle || defaultServicesSection.subtitle,
        services_cards,
        price_tilda: s.price_tilda || "",
        price_django: s.price_django || "",
        price_agents: s.price_agents || "",
        price_telegram: s.price_telegram || "",
        price_marketing: s.price_marketing || "",
        price_start: s.price_start || "",
        price_growth: s.price_growth || "",
        price_system: s.price_system || "",
        footer_legal: s.footer_legal || "",
        reviews: reviews.map((r, i) => ({
          id: r.id || `r${i + 1}`,
          text: r.text || "",
          author: r.author || "",
          role: r.role || "",
        })),
      });
      setPreviews({
        desktop: s.hero_desktop_image_url || null,
        mobile: s.hero_mobile_image_url || null,
        logo: s.logo_image_url || null,
      });
      setFiles({ desktop: null, mobile: null, logo: null });
      setClearFlags({ desktop: false, mobile: false, logo: false });
    } catch (e) {
      setError(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onPick = (key, fileList) => {
    const file = fileList?.[0] || null;
    setFiles((prev) => ({ ...prev, [key]: file }));
    setClearFlags((prev) => ({ ...prev, [key]: false }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [key]: url }));
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "reviews" || key === "services_cards") {
          fd.append(key, JSON.stringify(value));
        } else {
          fd.append(key, value ?? "");
        }
      });
      if (files.desktop) fd.append("heroDesktopFile", files.desktop);
      if (files.mobile) fd.append("heroMobileFile", files.mobile);
      if (files.logo) fd.append("logoFile", files.logo);
      if (clearFlags.desktop) fd.append("clear_hero_desktop", "true");
      if (clearFlags.mobile) fd.append("clear_hero_mobile", "true");
      if (clearFlags.logo) fd.append("clear_logo", "true");

      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      const parsed = await parseAdminJson(res);
      if (!res.ok) throw new Error(adminErrorMessage(parsed, "Не удалось сохранить", res.status));
      setOk("Сохранено. Обновите главную — изменения подтянутся.");
      setFiles({ desktop: null, mobile: null, logo: null });
      await load();
    } catch (err) {
      const msg = String(err?.message || "");
      if (/failed to fetch|networkerror|load failed/i.test(msg)) {
        setError(
          "Сеть оборвалась при сохранении. Проверьте, что Django запущен (порт 8000), и попробуйте снова — SVG/PNG/WebP поддерживаются."
        );
      } else {
        setError(msg || "Ошибка сохранения");
      }
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, opts = {}) => (
    <div>
      <label className="mb-2 block text-sm font-semibold text-ink">{label}</label>
      {opts.textarea ? (
        <textarea
          rows={opts.rows || 3}
          className="field-input min-h-[96px] resize-y"
          value={form[key]}
          onChange={(e) => setField(key, e.target.value)}
          placeholder={opts.placeholder}
        />
      ) : (
        <input
          className="field-input"
          value={form[key]}
          onChange={(e) => setField(key, e.target.value)}
          placeholder={opts.placeholder}
        />
      )}
      {opts.hint ? <p className="mt-1 text-xs text-ink-muted">{opts.hint}</p> : null}
    </div>
  );

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-28 pb-24">
      <div className="section-padding">
        <div className="mb-10">
          <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-teal">Админ</p>
          <h1 className="heading-md font-display font-bold text-ink">Главная и бренд</h1>
          <p className="mt-3 max-w-2xl text-sm text-ink-muted">
            Тексты hero, полоса доверия, цены, отзывы, обложки для макетов (десктоп/телефон) и логотип. Пустые поля
            оставляют значения по умолчанию / TODO_ на сайте.
          </p>
        </div>

        <AdminTabs />

        {error ? <p className="mb-4 text-sm text-clay">{error}</p> : null}
        {ok ? <p className="mb-4 text-sm text-teal">{ok}</p> : null}

        {loading ? (
          <p className="text-sm text-ink-muted">Загрузка…</p>
        ) : (
          <form onSubmit={save} className="space-y-8" noValidate>
            <section className="surface-card space-y-5 p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-ink">Hero</h2>
              {field("Заголовок", "hero_title", { placeholder: "Сайт, система и заявки — в одних руках" })}
              {field("Подзаголовок", "hero_subtitle", { textarea: true, rows: 3 })}
              <div className="grid gap-4 sm:grid-cols-2">
                {field("Кнопка 1", "hero_primary_cta", { placeholder: "Обсудить проект" })}
                {field("Кнопка 2", "hero_secondary_cta", { placeholder: "Смотреть работы" })}
              </div>
            </section>

            <section className="surface-card space-y-5 p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-ink">Ссылка в макете браузера</h2>
              <p className="text-sm text-ink-muted">
                Текст в адресной строке над десктоп-скрином. Если указать URL — по клику откроется в новой вкладке.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {field("Текст в строке", "hero_browser_label", {
                  placeholder: "banketnyy-zal-syuumbike",
                })}
                {field("Ссылка (URL)", "hero_browser_url", {
                  placeholder: "https://example.com",
                  hint: "Можно без https:// — добавим автоматически.",
                })}
              </div>
            </section>

            <section className="surface-card space-y-5 p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-ink">Обложки в макетах (десктоп / телефон)</h2>
              <p className="text-sm text-ink-muted">
                Если не загрузить — подставятся обложки кейсов с главной. Рекомендуется скрин сайта.
              </p>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">Десктоп (browser)</p>
                  {previews.desktop ? (
                    <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-xl border border-[var(--border-soft)] bg-cream-200">
                      <Image src={previews.desktop} alt="Десктоп обложка" fill className="object-cover" sizes="400px" />
                    </div>
                  ) : null}
                  <input type="file" accept="image/*" onChange={(e) => onPick("desktop", e.target.files)} />
                  <label className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
                    <input
                      type="checkbox"
                      checked={clearFlags.desktop}
                      onChange={(e) => setClearFlags((p) => ({ ...p, desktop: e.target.checked }))}
                    />
                    Удалить текущую
                  </label>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">Телефон</p>
                  {previews.mobile ? (
                    <div className="relative mb-3 aspect-[9/16] max-w-[180px] overflow-hidden rounded-xl border border-[var(--border-soft)] bg-cream-200">
                      <Image src={previews.mobile} alt="Мобильная обложка" fill className="object-cover" sizes="180px" />
                    </div>
                  ) : null}
                  <input type="file" accept="image/*" onChange={(e) => onPick("mobile", e.target.files)} />
                  <label className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
                    <input
                      type="checkbox"
                      checked={clearFlags.mobile}
                      onChange={(e) => setClearFlags((p) => ({ ...p, mobile: e.target.checked }))}
                    />
                    Удалить текущую
                  </label>
                </div>
              </div>
            </section>

            <section className="surface-card space-y-5 p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-ink">Логотип</h2>
              <p className="text-sm text-ink-muted">
                По умолчанию — `public/brand/logo-tagirov-black.svg`. Можно загрузить SVG, PNG, WebP или JPEG.
              </p>
              {previews.logo ? (
                <div className="mb-3 flex h-14 w-56 items-center overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previews.logo} alt="Логотип" className="h-full w-auto object-contain object-left" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/brand/logo-tagirov-black.svg" alt="Логотип по умолчанию" className="mb-3 h-10 w-auto" />
              )}
              <input
                type="file"
                accept=".svg,image/svg+xml,image/png,image/webp,image/jpeg,image/gif"
                onChange={(e) => onPick("logo", e.target.files)}
              />
              <label className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
                <input
                  type="checkbox"
                  checked={clearFlags.logo}
                  onChange={(e) => setClearFlags((p) => ({ ...p, logo: e.target.checked }))}
                />
                Сбросить загруженный логотип (вернуться к SVG)
              </label>
            </section>

            <section className="surface-card space-y-5 p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-ink">Полоса доверия</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {field("Значение 1", "trust_years_value", { placeholder: "5+", hint: "Было TODO_YEARS" })}
                {field("Подпись 1", "trust_years_label", { placeholder: "лет в разработке и запуске" })}
                {field("Значение 2", "trust_projects_value", { placeholder: "40+", hint: "Было TODO_PROJECTS+" })}
                {field("Подпись 2", "trust_projects_label", { placeholder: "запущенных проектов" })}
                {field("Значение 3", "trust_stack_value", { placeholder: "Tilda · Django · TG" })}
                {field("Подпись 3", "trust_stack_label", { placeholder: "стек под задачу бизнеса" })}
              </div>
            </section>

            <section className="surface-card space-y-5 p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-ink">Блок услуг (главная)</h2>
              <p className="text-sm text-ink-muted">
                Заголовок секции и тексты карточек. В каждой карточке: заголовок, основной текст, уточнение «для кого».
              </p>
              {field("Заголовок секции", "services_heading")}
              {field("Подзаголовок секции", "services_subtitle", { textarea: true, rows: 3 })}
              {(form.services_cards || []).map((card, idx) => (
                <div key={card.id} className="space-y-3 rounded-[16px] border border-[var(--border-soft)] bg-cream-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    {SERVICE_LABELS[card.id] || card.id}
                  </p>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink">Заголовок</label>
                    <input
                      className="field-input"
                      value={card.title}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm((prev) => {
                          const next = [...prev.services_cards];
                          next[idx] = { ...next[idx], title: v };
                          return { ...prev, services_cards: next };
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink">Основной текст</label>
                    <textarea
                      rows={4}
                      className="field-input min-h-[96px] resize-y"
                      value={card.outcome}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm((prev) => {
                          const next = [...prev.services_cards];
                          next[idx] = { ...next[idx], outcome: v };
                          return { ...prev, services_cards: next };
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink">Для кого / когда</label>
                    <textarea
                      rows={3}
                      className="field-input min-h-[80px] resize-y"
                      value={card.forWhom}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm((prev) => {
                          const next = [...prev.services_cards];
                          next[idx] = { ...next[idx], forWhom: v };
                          return { ...prev, services_cards: next };
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>

            <section className="surface-card space-y-5 p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-ink">Цены (только число / «от N»)</h2>
              <p className="text-sm text-ink-muted">На сайте отобразится как «от … ₽». Пусто = TODO_PRICE_*.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {field("Tilda", "price_tilda", { placeholder: "45000" })}
                {field("Веб-системы", "price_django", { placeholder: "120000" })}
                {field("ИИ-агенты", "price_agents", { placeholder: "50000" })}
                {field("Telegram", "price_telegram", { placeholder: "35000" })}
                {field("Маркетинг", "price_marketing", { placeholder: "25000" })}
                {field("Пакет Старт", "price_start", { placeholder: "40000" })}
                {field("Пакет Рост", "price_growth", { placeholder: "80000" })}
                {field("Пакет Система", "price_system", { placeholder: "150000" })}
              </div>
            </section>

            <section className="surface-card space-y-5 p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-ink">Отзывы (до 3)</h2>
              {form.reviews.map((r, idx) => (
                <div key={idx} className="space-y-3 rounded-[16px] border border-[var(--border-soft)] bg-cream-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Отзыв {idx + 1}</p>
                  <textarea
                    className="field-input min-h-[88px] resize-y"
                    placeholder="Текст отзыва"
                    value={r.text}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((prev) => {
                        const next = [...prev.reviews];
                        next[idx] = { ...next[idx], text: v };
                        return { ...prev, reviews: next };
                      });
                    }}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className="field-input"
                      placeholder="Имя / компания"
                      value={r.author}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm((prev) => {
                          const next = [...prev.reviews];
                          next[idx] = { ...next[idx], author: v };
                          return { ...prev, reviews: next };
                        });
                      }}
                    />
                    <input
                      className="field-input"
                      placeholder="Роль (опционально)"
                      value={r.role}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm((prev) => {
                          const next = [...prev.reviews];
                          next[idx] = { ...next[idx], role: v };
                          return { ...prev, reviews: next };
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>

            <section className="surface-card space-y-5 p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-ink">Подвал</h2>
              {field("Юридическая строка", "footer_legal", {
                placeholder: "Самозанятость / ИП — уточняйте при договоре.",
              })}
            </section>

            <Button type="submit" disabled={saving}>
              {saving ? "Сохранение…" : "Сохранить настройки"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
