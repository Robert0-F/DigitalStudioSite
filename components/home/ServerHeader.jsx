import Link from "next/link";
import { brand, services } from "@/lib/siteContent";

export default function ServerHeader({ logoUrl }) {
  const src = logoUrl || "/brand/logo-tagirov-black.svg";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[var(--bg-card)]/95 backdrop-blur">
      <div className="section-padding flex items-center justify-between gap-4 py-3">
        <Link href="/" className="inline-flex shrink-0 items-center" aria-label={brand.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={brand.name} className="h-10 w-auto object-contain object-left sm:h-12" width={200} height={40} />
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Основная навигация">
          <Link href="/portfolio" className="text-sm font-medium text-ink-muted hover:text-ink">
            Портфолио
          </Link>
          <Link href="#services" className="text-sm font-medium text-ink-muted hover:text-ink">
            Услуги
          </Link>
          <Link href="#process" className="text-sm font-medium text-ink-muted hover:text-ink">
            Как работаю
          </Link>
          <Link href="#contact" className="text-sm font-medium text-ink-muted hover:text-ink">
            Контакты
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a href={`tel:${brand.phoneTel}`} className="text-sm font-medium text-ink">
            {brand.phoneDisplay}
          </a>
          <a
            href="#contact"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white"
          >
            Обсудить проект
          </a>
        </div>

        {/* No-JS mobile menu */}
        <details className="relative md:hidden">
          <summary className="list-none cursor-pointer rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] px-3 py-2 text-sm font-semibold text-ink">
            Меню
          </summary>
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-4 shadow-soft">
            <ul className="flex flex-col gap-3 text-sm font-semibold text-ink">
              <li>
                <Link href="/portfolio">Портфолио</Link>
              </li>
              <li>
                <a href="#services">Услуги</a>
                <ul className="mt-2 space-y-1 border-l border-[var(--border-soft)] pl-3 text-ink-muted font-medium">
                  {services.map((s) => (
                    <li key={s.id}>
                      <Link href={s.href}>{s.title}</Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <a href="#process">Как работаю</a>
              </li>
              <li>
                <a href="#contact">Контакты</a>
              </li>
              <li>
                <a href={`tel:${brand.phoneTel}`}>{brand.phoneDisplay}</a>
              </li>
            </ul>
          </div>
        </details>
      </div>
    </header>
  );
}
