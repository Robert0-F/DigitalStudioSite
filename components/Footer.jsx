"use client";

import Link from "next/link";
import { Linkedin, Dribbble, Github, Mail, Phone, Send } from "lucide-react";
import SiteLogo from "./SiteLogo";

const nav = [
  { label: "Портфолио", href: "/#work" },
  { label: "Услуги", href: "/services" },
  { label: "Процесс", href: "/#process" },
  { label: "Контакты", href: "/#contact" },
];

function BehanceIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.337h6.848c2.344-.001 4.049.86 4.049 3.469 0 1.574-.915 2.664-2.404 3.07v.051c1.775.248 2.953 1.562 2.953 3.35 0 2.586-2.004 3.804-5.192 3.804zM3.814 8.625v3.25h2.9c1.416 0 2.1-.65 2.1-1.674 0-1.05-.684-1.576-2.1-1.576h-2.9zm0 5.125h3.122c1.576 0 2.404.65 2.404 1.9 0 1.275-.828 1.85-2.527 1.85H3.814v-3.75z" />
    </svg>
  );
}

const socials = [
  { href: "https://linkedin.com", label: "LinkedIn", Icon: Linkedin },
  { href: "https://behance.net", label: "Behance", Icon: BehanceIcon },
  { href: "https://dribbble.com", label: "Dribbble", Icon: Dribbble },
  { href: "https://github.com", label: "GitHub", Icon: Github },
];

export default function Footer() {
  return (
    <footer
      className="border-t border-white/[0.04] bg-[#08080c] py-20"
      role="contentinfo"
    >
      <div className="section-padding">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <div className="mb-4">
              <SiteLogo variant="footer" />
            </div>
            <p className="text-sm leading-relaxed text-[#71717a]">
              Проектируем и строим цифровые системы для бизнеса, который
              инвестирует в качество на годы вперёд.
            </p>
          </div>
          <nav aria-label="Подвал сайта">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#9ca3af] transition-colors hover:text-white link-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex gap-3">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-[#9ca3af] transition-all hover:border-[#6366f1]/30 hover:text-[#a5b4fc]"
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        <div className="mt-10 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-[#d4d4d8] sm:grid-cols-3">
          <a
            href="tel:+79173990611"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <Phone className="h-4 w-4 text-[#a5b4fc]" />
            +7 (917) 399-06-11
          </a>
          <a
            href="mailto:robrttagirov@gmail.com"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <Mail className="h-4 w-4 text-[#a5b4fc]" />
            robrttagirov@gmail.com
          </a>
          <a
            href="https://t.me/robertprog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <Send className="h-4 w-4 text-[#a5b4fc]" />
            @robertprog
          </a>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-sm text-[#71717a] sm:flex-row">
          <p>© Tagirov Digital Studio 2026. Все права защищены.</p>
          <p className="text-xs">Сделано с вниманием к деталям.</p>
        </div>
      </div>
    </footer>
  );
}
