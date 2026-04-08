"use client";

import { motion } from "framer-motion";
import { Target, Palette, BookOpen, LayoutGrid } from "lucide-react";

const icons = [Target, Palette, BookOpen, LayoutGrid];

export default function ServiceWhatWeDo({ items, title = "Что делаем" }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="what-heading">
      <div className="section-padding">
        <motion.h2
          id="what-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 font-display text-2xl font-bold text-white sm:text-3xl"
        >
          {title}
        </motion.h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <article className="flex h-full gap-4 rounded-xl border border-white/[0.06] bg-[#0a0a10] p-6 transition-colors hover:border-[#6366f1]/20">
                  <Icon
                    className="h-6 w-6 shrink-0 text-[#818cf8]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <div>
                    <h3 className="mb-2 font-display font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#9ca3af]">{item.text}</p>
                  </div>
                </article>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
