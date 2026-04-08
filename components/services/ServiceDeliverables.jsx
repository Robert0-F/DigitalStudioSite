"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function ServiceDeliverables({ items, tools, title = "Что вы получите" }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="deliver-heading">
      <div className="section-padding">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              id="deliver-heading"
              className="mb-6 font-display text-2xl font-bold text-white"
            >
              {title}
            </h2>
            <ul className="space-y-3">
              {items.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-[#d4d4d8]"
                >
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#6366f1]"
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
          {tools && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl border border-white/[0.06] p-8"
            >
              <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-[#a5b4fc]">
                Инструменты и методы
              </h3>
              <p className="leading-relaxed text-[#9ca3af]">{tools}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
