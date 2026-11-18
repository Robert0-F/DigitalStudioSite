"use client";

import Link from "next/link";
import { Mail, Phone, Send } from "lucide-react";
import SiteLogo from "./SiteLogo";
import { brand } from "@/lib/siteContent";
import useSiteSettings from "@/lib/useSiteSettings";

const nav = [
  { label: "Портфолио", href: "/portfolio" },
  { label: "Как работаю", href: "/#process" },
  { label: "Форматы", href: "/#pricing" },
  { label: "Контакты", href: "/#contact" },
];

export default function Footer() {
  const { settings } = useSiteSettings();
  const services = settings.services;

  return (
    <footer className="border-t border-[var(--border-soft)] bg-cream-200 py-16" role="contentinfo">
      <div className="section-padding">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <div className="mb-4">
              <SiteLogo variant="footer" />
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              Сайты, Django-системы, Telegram-боты и маркетинг в Яндексе — от запуска до заявок.
            </p>
          </div>

          <nav aria-label="Подвал">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Разделы</p>
            <ul className="space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline text-sm text-ink hover:text-teal">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Услуги</p>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={s.href} className="link-underline text-sm text-ink hover:text-teal">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-3 rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-card)] p-5 text-sm text-ink sm:grid-cols-3">
          <a href={`tel:${brand.phoneTel}`} className="flex items-center gap-2 hover:text-teal">
            <Phone className="h-4 w-4 text-teal" strokeWidth={1.75} />
            {brand.phoneDisplay}
          </a>
          <a href={`mailto:${brand.email}`} className="flex items-center gap-2 hover:text-teal">
            <Mail className="h-4 w-4 text-teal" strokeWidth={1.75} />
            {brand.email}
          </a>
          <a
            href={brand.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-teal"
          >
            <Send className="h-4 w-4 text-teal" strokeWidth={1.75} />
            {brand.telegramHandle}
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--border-soft)] pt-6 text-sm text-ink-muted sm:flex-row sm:justify-between">
          <p>
            © {brand.name} {new Date().getFullYear()}
          </p>
          <p className="text-xs">{settings.footerLegal}</p>
        </div>
      </div>
    </footer>
  );
}
