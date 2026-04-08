"use client";

import { motion } from "framer-motion";

export default function ServiceTechRow({ tech, title = "Технологии" }) {
  return (
    <section className="py-14 sm:py-18" aria-labelledby="tech-heading">
      <div className="section-padding text-center">
        <motion.h2
          id="tech-heading"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#71717a]"
        >
          {title}
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-3">
          {tech.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[#d4d4d8]"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
