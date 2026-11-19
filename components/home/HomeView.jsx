import Link from "next/link";
import { brand, workProcess, turnkeySteps, faqItems } from "@/lib/siteContent";
import ServerHeader from "@/components/home/ServerHeader";

/**
 * Server-only homepage shell — no Framer / portals / client hooks.
 * Phone can render this from HTML+CSS even if Next hydration never runs.
 */
/** JPEG always works on iPhone; WebP from /media sometimes shows a blue broken square. */
function HeroPicture({ webpSrc, jpegSrc, alt, className, width, height }) {
  return (
    <picture>
      {webpSrc ? <source srcSet={webpSrc} type="image/webp" /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={jpegSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        decoding="async"
      />
    </picture>
  );
}

function HeroMedia({ desktopUrl, mobileUrl, covers }) {
  const desktopWebp = desktopUrl || covers[0]?.hero_image_url || null;
  const mobileWebp = mobileUrl || covers[1]?.hero_image_url || covers[0]?.hero_image_url || null;

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="overflow-hidden rounded-device border border-[var(--border-soft)] bg-[var(--bg-card)] shadow-card">
        <div className="flex h-7 items-center gap-1.5 border-b border-[var(--border-soft)] bg-cream-200 px-2.5">
          <span className="h-2 w-2 rounded-full bg-clay/70" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-[#d4a017]/80" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-teal/70" aria-hidden />
        </div>
        <HeroPicture
          webpSrc={desktopWebp}
          jpegSrc="/hero/hero-desktop.jpg"
          alt={covers[0]?.title || "Пример сайта"}
          className="aspect-[16/10] w-full object-cover object-top"
          width={720}
          height={450}
        />
      </div>
      <div className="absolute -bottom-5 -right-4 w-[34%] overflow-hidden rounded-[1.35rem] border-[3px] border-ink bg-[var(--bg-card)] shadow-lift sm:-right-8 sm:w-[36%]">
        <HeroPicture
          webpSrc={mobileWebp}
          jpegSrc="/hero/hero-mobile.jpg"
          alt={covers[1]?.title || covers[0]?.title || "Мобильный вид"}
          className="aspect-[9/16] w-full object-cover object-top"
          width={180}
          height={320}
        />
      </div>
    </div>
  );
}

export default function HomeView({ settings, covers = [] }) {
  const { hero, trustStrip, services, servicesSection, pricingPackages, reviews, footerLegal, logoUrl } =
    settings;

  return (
    <>
      <ServerHeader logoUrl={logoUrl} />

      <main id="main-content">
        <section className="paper-hero relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-16" aria-labelledby="hero-heading">
          <div className="section-padding relative grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-xl">
              <p className="chip-accent mb-4">Агенты · Сайты · Системы · Трафик</p>
              <h1 id="hero-heading" className="heading-xl text-ink">
                {hero.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-ink-muted">{hero.subtitle}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#contact"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white"
                >
                  {hero.primaryCta}
                </a>
                <a
                  href="#work"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] px-6 py-3 text-sm font-semibold text-ink"
                >
                  {hero.secondaryCta}
                </a>
              </div>
            </div>
            <div className="overflow-x-clip pb-10 pr-2 sm:pb-12 lg:pb-4 lg:pr-0">
              <HeroMedia
                desktopUrl={settings.heroDesktopUrl}
                mobileUrl={settings.heroMobileUrl}
                covers={covers}
              />
            </div>
          </div>
        </section>

        <div className="section-padding relative -mt-2 pb-4 sm:pb-6">
          <ul className="grid gap-4 rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-card)] p-5 shadow-soft sm:grid-cols-3 sm:p-6">
            {trustStrip.map((item) => (
              <li key={item.label} className="text-center sm:text-left">
                <p className="font-display text-xl font-extrabold text-teal sm:text-2xl">{item.value}</p>
                <p className="mt-1 text-sm text-ink-muted">{item.label}</p>
              </li>
            ))}
          </ul>
        </div>

        <section id="services" className="section-y bg-cream-100" aria-labelledby="services-heading">
          <div className="section-padding">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Услуги</p>
            <h2 id="services-heading" className="heading-lg max-w-2xl text-ink">
              {servicesSection.heading}
            </h2>
            <p className="mt-4 max-w-2xl text-ink-muted">{servicesSection.subtitle}</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href={s.href}
                    className="surface-card flex h-full flex-col p-6 transition hover:shadow-lift"
                  >
                    <h3 className="heading-md text-ink">{s.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-ink">{s.outcome}</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.forWhom}</p>
                    <p className="mt-6 text-sm font-semibold text-clay">от {s.priceFrom} ₽</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="work" className="section-y" aria-labelledby="work-heading">
          <div className="section-padding">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Портфолио</p>
            <h2 id="work-heading" className="heading-lg text-ink">
              Смотри, что уже сделано
            </h2>
            <p className="mt-4 max-w-2xl text-ink-muted">Кейсы и обложки — на отдельной странице.</p>
            <Link
              href="/portfolio"
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white"
            >
              Все проекты →
            </Link>
          </div>
        </section>

        <section id="turnkey" className="section-y surface-inverse" aria-labelledby="turnkey-heading">
          <div className="section-padding">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-soft)]">Под ключ</p>
            <h2 id="turnkey-heading" className="heading-lg max-w-2xl text-[var(--text-inverse)]">
              Продукт, заявки и трафик — без «отдела на отдел»
            </h2>
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {turnkeySteps.map((step, idx) => (
                <li key={step.title} className="rounded-[18px] border border-white/10 bg-white/[0.04] p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-soft)]">
                    Шаг {idx + 1}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-[var(--text-inverse)]">{step.title}</h3>
                  <p className="mt-2 text-sm text-[var(--text-inverse)]/65">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="process" className="section-y bg-cream-100" aria-labelledby="process-heading">
          <div className="section-padding">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Как я работаю</p>
            <h2 id="process-heading" className="heading-lg max-w-2xl text-ink">
              От заявки до запуска — по шагам и срокам
            </h2>
            <ol className="mt-10 space-y-3">
              {workProcess.map((step, idx) => (
                <li
                  key={step.title}
                  className="grid gap-3 rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-card)] p-5 shadow-soft sm:grid-cols-[auto_1fr_auto] sm:items-start"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-teal text-sm font-bold text-white">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{step.description}</p>
                  </div>
                  <p className="text-sm font-semibold text-clay sm:pt-1 sm:text-right">{step.time}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="section-y" aria-labelledby="pricing-heading">
          <div className="section-padding">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Форматы</p>
            <h2 id="pricing-heading" className="heading-lg text-ink">
              Ориентиры по объёму — смета после созвона
            </h2>
            <ul className="mt-10 grid gap-4 lg:grid-cols-3">
              {pricingPackages.map((pkg) => (
                <li
                  key={pkg.id}
                  className={`flex flex-col rounded-[18px] border p-6 ${
                    pkg.featured
                      ? "border-teal bg-[var(--bg-card)] shadow-lift"
                      : "border-[var(--border-soft)] bg-cream-50 shadow-soft"
                  }`}
                >
                  {pkg.featured ? <span className="chip mb-3 w-fit">Чаще всего</span> : null}
                  <h3 className="font-display text-xl font-bold text-ink">{pkg.name}</h3>
                  <p className="mt-2 font-display text-2xl font-extrabold text-teal">{pkg.price}</p>
                  <p className="mt-3 text-sm text-ink-muted">{pkg.description}</p>
                  <a
                    href="#contact"
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Обсудить этот формат
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="reviews" className="section-y bg-cream-100" aria-labelledby="reviews-heading">
          <div className="section-padding">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Отзывы</p>
            <h2 id="reviews-heading" className="heading-lg text-ink">
              Что говорят клиенты
            </h2>
            {reviews?.length ? (
              <ul className="mt-10 grid gap-4 md:grid-cols-2">
                {reviews.map((r) => (
                  <li key={r.id || `${r.author}-${r.text?.slice(0, 12)}`} className="surface-card p-6">
                    <p className="leading-relaxed text-ink">«{r.text}»</p>
                    <p className="mt-4 text-sm font-semibold text-ink">{r.author}</p>
                    {r.role ? <p className="text-xs text-ink-muted">{r.role}</p> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-8 text-ink-muted">Пока без публичных отзывов</p>
            )}
          </div>
        </section>

        <section id="faq" className="section-y" aria-labelledby="faq-heading">
          <div className="section-padding">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">FAQ</p>
            <h2 id="faq-heading" className="heading-lg text-ink">
              Частые вопросы до старта
            </h2>
            <div className="mt-8 space-y-3">
              {faqItems.map((item) => (
                <details
                  key={item.q}
                  className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-card)] p-5 shadow-soft"
                >
                  <summary className="cursor-pointer font-display text-base font-bold text-ink">{item.q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section-y scroll-mt-24 bg-cream-100" aria-labelledby="contact-heading">
          <div className="section-padding max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Заявка</p>
            <h2 id="contact-heading" className="heading-lg text-ink">
              Расскажите задачу — отвечу в рабочие часы
            </h2>
            <p className="mt-4 text-ink-muted">
              Напишите в Telegram или позвоните — так надёжнее с телефона, чем через тяжёлую форму.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <a
                href={brand.telegramUrl}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white"
              >
                Написать в Telegram
              </a>
              <a href={`tel:${brand.phoneTel}`} className="text-sm font-medium text-ink">
                Телефон {brand.phoneDisplay}
              </a>
              <a href={`mailto:${brand.email}`} className="text-sm font-medium text-ink">
                Email {brand.email}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-soft)] bg-cream-200 py-12" role="contentinfo">
        <div className="section-padding">
          <p className="font-display text-lg font-bold text-ink">{brand.name}</p>
          <p className="mt-2 max-w-md text-sm text-ink-muted">
            Сайты, Django-системы, Telegram-боты и маркетинг в Яндексе — от запуска до заявок.
          </p>
          <p className="mt-8 text-xs text-ink-muted">
            © {brand.shortName} Digital Studio {new Date().getFullYear()}
          </p>
          <p className="mt-2 text-xs text-ink-muted">{footerLegal}</p>
        </div>
      </footer>
    </>
  );
}
