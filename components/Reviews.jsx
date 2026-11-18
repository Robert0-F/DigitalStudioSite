"use client";

import { MessageSquareQuote } from "lucide-react";
import IconBox from "@/components/ui/IconBox";
import useSiteSettings from "@/lib/useSiteSettings";

export default function Reviews() {
  const { settings } = useSiteSettings();
  const reviews = settings.reviews;

  return (
    <section id="reviews" className="section-y bg-cream-100" aria-labelledby="reviews-heading">
      <div className="section-padding">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Отзывы</p>
        <h2 id="reviews-heading" className="heading-lg text-ink">
          Что говорят клиенты
        </h2>

        {reviews.length ? (
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id || `${r.author}-${r.text?.slice(0, 12)}`} className="surface-card p-6">
                <IconBox className="mb-4">
                  <MessageSquareQuote className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </IconBox>
                <p className="leading-relaxed text-ink">«{r.text}»</p>
                <p className="mt-4 text-sm font-semibold text-ink">{r.author}</p>
                {r.role ? <p className="text-xs text-ink-muted">{r.role}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-[18px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-card)] p-8">
            <IconBox className="mb-4">
              <MessageSquareQuote className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </IconBox>
            <p className="font-display text-lg font-bold text-ink">Пока без публичных отзывов</p>
            <p className="mt-2 max-w-xl text-sm text-ink-muted">
              Добавьте отзывы в админке → «Главная». Показываем только с разрешением клиентов.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
