"use client";

import { motion, useReducedMotion } from "framer-motion";
import { workProcess } from "@/lib/siteContent";

export default function Process() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="process" className="section-y bg-cream-100" aria-labelledby="process-heading">
      <div className="section-padding">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Как я работаю</p>
        <h2 id="process-heading" className="heading-lg max-w-2xl text-ink">
          От заявки до запуска — по шагам и срокам
        </h2>

        <ol className="relative mt-10 space-y-3">
          <div
            className="pointer-events-none absolute bottom-6 left-[1.35rem] top-6 hidden w-px bg-[var(--border-strong)] sm:block"
            aria-hidden
          />
          {workProcess.map((step, idx) => (
            <motion.li
              key={step.title}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="relative grid gap-3 rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-card)] p-5 shadow-soft sm:grid-cols-[auto_1fr_auto] sm:items-start"
            >
              <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-[12px] bg-teal text-sm font-bold text-white">
                {idx + 1}
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{step.description}</p>
              </div>
              <p className="text-sm font-semibold text-clay sm:pt-1 sm:text-right">{step.time}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
