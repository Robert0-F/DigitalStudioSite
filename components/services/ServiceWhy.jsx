"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ServiceWhy({ title, bullets }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="why-heading">
      <div className="section-padding">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-luxury rounded-2xl border border-[#6366f1]/10 p-8 sm:p-10"
        >
          <div className="mb-8 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-[#a5b4fc]" aria-hidden />
            <h2
              id="why-heading"
              className="font-display text-xl font-bold text-white sm:text-2xl"
            >
              {title}
            </h2>
          </div>
          <ul className="space-y-4">
            {bullets.map((line) => (
              <li
                key={line.slice(0, 40)}
                className="flex gap-3 border-l-2 border-[#6366f1]/40 pl-4 text-[#d4d4d8] leading-relaxed"
              >
                {line}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
