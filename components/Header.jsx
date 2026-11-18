"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronDown, Send } from "lucide-react";
import Button from "./ui/Button";
import SiteLogo from "./SiteLogo";
import LeadModal from "./LeadModal";
import { brand, services } from "@/lib/siteContent";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const serviceLinks = services.map((s) => ({ href: s.href, label: s.title }));

function scrollTo(e, id) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const dropdownRef = useRef(null);
  const menuScrollYRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setServicesOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!open) return;
    menuScrollYRef.current = window.scrollY;
    const prev = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${menuScrollYRef.current}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      window.scrollTo(0, menuScrollYRef.current);
    };
  }, [open]);

  const openLeadModal = () => {
    trackGoal("cta_header");
    window.dispatchEvent(new CustomEvent("lead-modal:open"));
    setOpen(false);
    setServicesOpen(false);
  };

  const mobileMenu = mounted ? (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="mobile-menu-backdrop"
            className="fixed inset-0 z-[60] min-h-[100dvh] w-full bg-ink/35 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.nav
            key="mobile-menu-panel"
            id="mobile-menu"
            className="fixed right-0 top-0 z-[70] flex h-[100dvh] w-[min(100%,320px)] flex-col overflow-y-auto border-l border-[var(--border-soft)] bg-[var(--bg-card)] p-8 shadow-soft md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            aria-label="Мобильная навигация"
          >
            <div className="mb-10 flex items-center justify-between">
              <SiteLogo variant="header" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-[var(--border-soft)] p-2 text-ink hover:bg-cream-200"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/portfolio" className="text-lg font-semibold text-ink" onClick={() => setOpen(false)}>
                  Портфолио
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setMobileServices(!mobileServices)}
                  className="flex w-full items-center justify-between text-lg font-semibold text-ink"
                >
                  Услуги
                  <ChevronDown className={`h-5 w-5 transition-transform ${mobileServices ? "rotate-180" : ""}`} strokeWidth={1.75} />
                </button>
                {mobileServices ? (
                  <ul className="mt-3 flex flex-col gap-2 border-l border-[var(--border-soft)] pl-4">
                    {serviceLinks.map((s) => (
                      <li key={s.href}>
                        <Link href={s.href} className="text-ink-muted hover:text-teal" onClick={() => setOpen(false)}>
                          {s.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
              <li>
                <Link href={isHome ? "#process" : "/#process"} className="text-lg font-semibold text-ink" onClick={() => setOpen(false)}>
                  Как работаю
                </Link>
              </li>
              <li>
                <Link href={isHome ? "#contact" : "/#contact"} className="text-lg font-semibold text-ink" onClick={() => setOpen(false)}>
                  Контакты
                </Link>
              </li>
            </ul>
            <div className="mt-auto space-y-3 pt-10">
              <a href={`tel:${brand.phoneTel}`} className="block text-sm font-medium text-ink">
                {brand.phoneDisplay}
              </a>
              <Button className="w-full" onClick={openLeadModal} type="button">
                Обсудить проект
              </Button>
            </div>
          </motion.nav>
        </>
      ) : null}
    </AnimatePresence>
  ) : null;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--border-soft)] bg-[var(--bg-card)]/95 py-3 shadow-soft backdrop-blur"
          : "bg-transparent py-5"
      }`}
    >
      <div className="section-padding flex items-center justify-between gap-4">
        <SiteLogo variant="header" />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Основная навигация">
          <Link href="/portfolio" className="link-underline text-sm font-medium text-ink-muted transition-colors hover:text-ink">
            Портфолио
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setServicesOpen(!servicesOpen)}
              className="flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              aria-expanded={servicesOpen}
            >
              Услуги
              <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} strokeWidth={1.75} />
            </button>
            <AnimatePresence>
              {servicesOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 top-full z-50 mt-2 min-w-[240px] rounded-[14px] border border-[var(--border-soft)] bg-[var(--bg-card)] py-2 shadow-card"
                >
                  {serviceLinks.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="block px-4 py-2.5 text-sm text-ink-muted hover:bg-cream-100 hover:text-ink"
                      onClick={() => setServicesOpen(false)}
                    >
                      {s.label}
                    </Link>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {isHome ? (
            <a href="#process" onClick={(e) => scrollTo(e, "process")} className="link-underline text-sm font-medium text-ink-muted hover:text-ink">
              Как работаю
            </a>
          ) : (
            <Link href="/#process" className="link-underline text-sm font-medium text-ink-muted hover:text-ink">
              Как работаю
            </Link>
          )}

          {isHome ? (
            <a href="#contact" onClick={(e) => scrollTo(e, "contact")} className="link-underline text-sm font-medium text-ink-muted hover:text-ink">
              Контакты
            </a>
          ) : (
            <Link href="/#contact" className="link-underline text-sm font-medium text-ink-muted hover:text-ink">
              Контакты
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a href={`tel:${brand.phoneTel}`} className="text-sm font-medium text-ink/90 hover:text-ink">
            {brand.phoneDisplay}
          </a>
          <a
            href={brand.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] text-ink-muted transition hover:border-teal hover:text-teal"
            aria-label="Telegram"
            onClick={() => trackGoal("telegram_click")}
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
          </a>
          <Button onClick={openLeadModal}>Обсудить проект</Button>
        </div>

        <button
          type="button"
          className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-2.5 text-ink md:hidden"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Открыть меню"
        >
          <Menu className="h-6 w-6" strokeWidth={1.75} />
        </button>
      </div>

      {mobileMenu ? createPortal(mobileMenu, document.body) : null}
      <LeadModal />
    </header>
  );
}
