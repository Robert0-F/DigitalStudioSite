"use client";

import Image from "next/image";

function Placeholder({ title }) {
  const label = (title || "Проект").slice(0, 28);
  return (
    <div className="flex h-full w-full flex-col justify-end bg-gradient-to-br from-teal-muted via-cream-200 to-clay-soft p-4">
      <p className="font-display text-sm font-bold text-ink line-clamp-2">{label}</p>
    </div>
  );
}

export function BrowserFrame({
  src,
  alt = "",
  title = "",
  urlLabel = "tagirovweb.ru",
  urlHref = "",
  className = "",
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 720px",
  quality = 90,
}) {
  const label = urlLabel || "tagirovweb.ru";
  const href = String(urlHref || "").trim();
  const labelNode = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="ml-2 truncate text-[10px] leading-none text-ink-muted underline-offset-2 transition-colors hover:text-teal hover:underline"
      title={`Открыть ${href}`}
    >
      {label}
    </a>
  ) : (
    <span className="ml-2 truncate text-[10px] leading-none text-ink-muted">{label}</span>
  );

  return (
    <div
      className={`overflow-hidden rounded-device border border-[var(--border-soft)] bg-[var(--bg-card)] shadow-card ${className}`}
    >
      {/* Компактная chrome-полоска — меньше съедает шапку скриншота */}
      <div className="flex h-7 items-center gap-1.5 border-b border-[var(--border-soft)] bg-cream-200 px-2.5">
        <span className="h-2 w-2 rounded-full bg-clay/70" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-[#d4a017]/80" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-teal/70" aria-hidden />
        {labelNode}
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
        {src ? (
          <Image
            src={src}
            alt={alt || title || "Скриншот проекта"}
            fill
            className="object-cover object-top"
            sizes={sizes}
            quality={quality}
            priority={priority}
          />
        ) : (
          <Placeholder title={title} />
        )}
      </div>
    </div>
  );
}

export function PhoneFrame({
  src,
  alt = "",
  title = "",
  className = "",
  priority = false,
  sizes = "280px",
  quality = 90,
}) {
  return (
    <div
      className={`overflow-hidden rounded-[1.35rem] border-[3px] border-ink bg-[var(--bg-card)] shadow-lift ${className}`}
    >
      <div className="mx-auto mt-1.5 h-1 w-10 rounded-full bg-ink/20" aria-hidden />
      <div className="relative aspect-[9/16] overflow-hidden bg-cream-200">
        {src ? (
          <Image
            src={src}
            alt={alt || title || "Мобильный экран проекта"}
            fill
            className="object-cover object-top"
            sizes={sizes}
            quality={quality}
            priority={priority}
          />
        ) : (
          <Placeholder title={title} />
        )}
      </div>
    </div>
  );
}
