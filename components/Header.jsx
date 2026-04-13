"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Send } from "lucide-react";
import Button from "./ui/Button";
import SiteLogo from "./SiteLogo";
import LeadModal from "./LeadModal";

const serviceLinks = [
  { href: "/services/web", label: "Веб и платформы" },
  { href: "/services/crm", label: "CRM и автоматизация" },
  { href: "/services/ui-ux", label: "UI/UX дизайн" },
  { href: "/services/brand", label: "Бренд и айдентика" },
];

function scrollTo(e, id) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isServicePage = pathname?.startsWith("/services/") && pathname !== "/services";
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const dropdownRef = useRef(null);
  const menuScrollYRef = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setServicesOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    menuScrollYRef.current = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${menuScrollYRef.current}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, menuScrollYRef.current);
    };
  }, [open]);

  const openLeadModal = () => {
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
          className="fixed inset-0 z-[60] min-h-[100dvh] min-h-[100svh] w-full bg-black/70 backdrop-blur-md md:hidden"
          style={{ touchAction: "none" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        />
        <motion.nav
          key="mobile-menu-panel"
          id="mobile-menu"
          className="fixed right-0 top-0 z-[70] flex h-[100dvh] max-h-[100dvh] w-[min(100%,320px)] flex-col overflow-y-auto overscroll-contain border-l border-white/10 bg-[#0a0a10] p-8 shadow-2xl md:hidden"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 320 }}
          aria-label="Мобильная навигация"
        >
          <div className="mb-10 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-white hover:bg-white/10"
              aria-label="Закрыть"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                href="/portfolio"
                className="text-lg font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Портфолио
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setMobileServices(!mobileServices)}
                className="flex w-full items-center justify-between text-lg font-semibold text-white"
              >
                Услуги
                <ChevronDown className={`h-5 w-5 ${mobileServices ? "rotate-180" : ""}`} />
              </button>
              {mobileServices && (
                <ul className="mt-3 flex flex-col gap-2 border-l border-white/10 pl-4">
                  <li>
                    <Link href="/services" className="text-[#9ca3af]" onClick={() => setOpen(false)}>
                      Все услуги
                    </Link>
                  </li>
                  {serviceLinks.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="text-[#9ca3af]"
                        onClick={() => setOpen(false)}
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <Link href="/#process" className="text-lg font-semibold text-white" onClick={() => setOpen(false)}>
                Процесс
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="text-lg font-semibold text-white" onClick={() => setOpen(false)}>
                Контакты
              </Link>
            </li>
          </ul>
          <div className="mt-auto pt-10">
            <Button
              className="w-full"
              onClick={openLeadModal}
              type="button"
            >
              Начать проект
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
        scrolled ? "glass-strong py-3 shadow-lg" : "bg-transparent py-5"
      }`}
    >
      <div className="section-padding flex items-center justify-between gap-4">
        <SiteLogo variant="header" priority />

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Основная навигация"
        >
          <Link
            href="/portfolio"
            className="text-sm font-medium text-[#9ca3af] transition-colors hover:text-white link-underline"
          >
            Портфолио
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setServicesOpen(!servicesOpen)}
              className="flex items-center gap-1 text-sm font-medium text-[#9ca3af] transition-colors hover:text-white"
              aria-expanded={servicesOpen}
              aria-haspopup="true"
            >
              Услуги
              <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 top-full z-50 mt-2 min-w-[240px] rounded-xl border border-white/10 bg-[#0c0c12]/95 py-2 shadow-depth backdrop-blur-xl"
                >
                  <Link
                    href="/services"
                    className="block px-4 py-2.5 text-sm text-white hover:bg-white/5"
                    onClick={() => setServicesOpen(false)}
                  >
                    Все услуги
                  </Link>
                  <div className="my-1 h-px bg-white/10" />
                  {serviceLinks.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="block px-4 py-2.5 text-sm text-[#9ca3af] hover:bg-white/5 hover:text-white"
                      onClick={() => setServicesOpen(false)}
                    >
                      {s.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isHome ? (
            <a
              href="#process"
              onClick={(e) => scrollTo(e, "process")}
              className="text-sm font-medium text-[#9ca3af] transition-colors hover:text-white link-underline"
            >
              Процесс
            </a>
          ) : (
            <Link
              href="/#process"
              className="text-sm font-medium text-[#9ca3af] transition-colors hover:text-white link-underline"
            >
              Процесс
            </Link>
          )}

          {isHome ? (
            <a
              href="#contact"
              onClick={(e) => scrollTo(e, "contact")}
              className="text-sm font-medium text-[#9ca3af] transition-colors hover:text-white link-underline"
            >
              Контакты
            </a>
          ) : (
            <Link
              href="/#contact"
              className="text-sm font-medium text-[#9ca3af] transition-colors hover:text-white link-underline"
            >
              Контакты
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:+79173990611"
            className="text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            +7 (917) 399-06-11
          </a>
          <a
            href="https://t.me/robertprog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-[#9ca3af] transition-all hover:border-[#6366f1]/30 hover:text-[#a5b4fc]"
            aria-label="Telegram"
            title="Telegram @robertprog"
          >
            <Send className="h-4 w-4" />
          </a>
          <Button onClick={openLeadModal}>Начать проект</Button>
        </div>

        <button
          type="button"
          className="rounded-xl border border-white/10 glass p-2.5 text-white md:hidden"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Открыть меню"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {mobileMenu ? createPortal(mobileMenu, document.body) : null}

      <LeadModal />
    </header>
  );
}
