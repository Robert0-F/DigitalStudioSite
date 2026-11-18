"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqItems } from "@/lib/siteContent";

export default function FAQ() {
  const baseId = useId();
  const [openId, setOpenId] = useState(0);

  return (
    <section id="faq" className="section-y" aria-labelledby="faq-heading">
      <div className="section-padding max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">FAQ</p>
        <h2 id="faq-heading" className="heading-lg text-ink">
          Частые вопросы до старта
        </h2>

        <ul className="mt-8 space-y-3">
          {faqItems.map((item, idx) => {
            const open = openId === idx;
            const panelId = `${baseId}-panel-${idx}`;
            const buttonId = `${baseId}-btn-${idx}`;
            return (
              <li key={item.q} className="overflow-hidden rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-card)]">
                <button
                  id={buttonId}
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenId(open ? -1 : idx)}
                >
                  <span className="font-display font-semibold text-ink">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-teal transition ${open ? "rotate-180" : ""}`}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </button>
                {open ? (
                  <div id={panelId} role="region" aria-labelledby={buttonId} className="border-t border-[var(--border-soft)] px-5 py-4">
                    <p className="text-sm leading-relaxed text-ink-muted">{item.a}</p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
