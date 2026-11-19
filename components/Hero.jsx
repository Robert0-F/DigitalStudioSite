"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import { BrowserFrame, PhoneFrame } from "@/components/ui/DeviceFrame";
import { brand } from "@/lib/siteContent";
import { enterY, visibleY } from "@/lib/motionSafe";
import useSiteSettings from "@/lib/useSiteSettings";
import { trackGoal } from "@/components/analytics/YandexMetrika";

function HeroDevices({
  desktopUrl,
  mobileUrl,
  projects,
  reduceMotion,
  browserUrlLabel = "",
  browserUrlHref = "",
}) {
  const primary = projects[0] || null;
  const secondary = projects[1] || projects[0] || null;
  const browserSrc = desktopUrl || primary?.hero_image_url || null;
  const phoneSrc = mobileUrl || secondary?.hero_image_url || primary?.hero_image_url || null;
  const browserLabel =
    browserUrlLabel ||
    (primary?.slug ? String(primary.slug) : "") ||
    "portfolio";
  const browserHref = browserUrlHref || primary?.live_url || "";

  return (
    <div className="group relative mx-auto w-full max-w-lg lg:max-w-none">
      <div
        className="pointer-events-none absolute -inset-6 -z-10 opacity-40"
        style={{
          backgroundImage: "url(/brand/paper-noise.svg)",
          backgroundSize: "180px",
        }}
        aria-hidden
      />
      <motion.div
        className="relative z-10"
        initial={enterY(reduceMotion, 18)}
        animate={visibleY}
        transition={{ duration: 0.45 }}
      >
        <BrowserFrame
          src={browserSrc}
          title={primary?.title || brand.shortName}
          alt={desktopUrl ? "Обложка сайта (десктоп)" : primary?.title ? `Обложка: ${primary.title}` : "Пример работы"}
          urlLabel={browserLabel}
          urlHref={browserHref}
          priority
          sizes="(max-width: 1024px) 95vw, 720px"
          quality={92}
        />
      </motion.div>

      <motion.div
        className="absolute -bottom-5 -right-10 z-20 w-[34%] sm:-bottom-6 sm:-right-12 sm:w-[36%]"
        initial={enterY(reduceMotion, 28)}
        animate={visibleY}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <PhoneFrame
          src={phoneSrc}
          title={secondary?.title || primary?.title || brand.shortName}
          alt={mobileUrl ? "Обложка сайта (мобильная)" : secondary?.title ? `Мобильный вид: ${secondary.title}` : "Мобильный пример"}
          priority
          sizes="(max-width: 1024px) 40vw, 280px"
          quality={92}
        />
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const { settings } = useSiteSettings();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/portfolio?home=1");
        const json = await res.json().catch(() => null);
        if (!alive) return;
        const list = Array.isArray(json?.projects) ? json.projects : [];
        const withCovers = list.filter((p) => p?.hero_image_url);
        setProjects((withCovers.length ? withCovers : list).slice(0, 2));
      } catch {
        if (alive) setProjects([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const openLead = () => {
    trackGoal("cta_hero");
    window.dispatchEvent(new CustomEvent("lead-modal:open"));
  };

  const { hero, trustStrip } = settings;

  return (
    <>
      <section className="paper-hero relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-16" aria-labelledby="hero-heading">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{ backgroundImage: "url(/brand/grid-soft.svg)", backgroundSize: "48px" }}
          aria-hidden
        />

        <div className="section-padding relative grid items-center gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="max-w-xl">
            <p className="chip-accent mb-4">Агенты · Сайты · Системы · Трафик</p>
            <h1 id="hero-heading" className="heading-xl text-ink">
              {hero.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">{hero.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button onClick={openLead}>{hero.primaryCta}</Button>
              <Button as="a" href="#work" variant="secondary">
                {hero.secondaryCta}
              </Button>
            </div>
          </div>

          <div className="overflow-x-clip pb-10 pr-2 sm:pb-12 sm:pr-4 lg:overflow-visible lg:pb-4 lg:pr-0">
            <HeroDevices
              desktopUrl={settings.heroDesktopUrl}
              mobileUrl={settings.heroMobileUrl}
              projects={projects}
              reduceMotion={reduceMotion}
              browserUrlLabel={hero.browserLabel}
              browserUrlHref={hero.browserUrl}
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
    </>
  );
}
