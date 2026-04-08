"use client";

import { motion } from "framer-motion";

export default function ServicePhases({ items, title }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="phases-heading">
      <div className="section-padding">
        <motion.h2
          id="phases-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 font-display text-2xl font-bold text-white sm:text-3xl"
        >
          {title}
        </motion.h2>
        <ol className="space-y-4">
          {items.map((item, i) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-5 rounded-xl border border-white/[0.06] bg-[#0c0c12]/80 p-6 sm:gap-6 sm:p-7"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 font-display text-sm font-bold text-[#a5b4fc]"
                aria-hidden
              >
                {i + 1}
              </span>
              <div>
                <h3 className="mb-2 font-display font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#9ca3af]">
                  {item.text}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
