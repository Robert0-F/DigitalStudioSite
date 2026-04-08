"use client";

import { motion } from "framer-motion";

export default function ServiceOverview({ text, title = "Подход" }) {
  return (
    <section className="py-16 sm:py-22" aria-labelledby="overview-heading">
      <div className="section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="glass-luxury mx-auto max-w-3xl rounded-2xl border border-white/[0.06] p-8 sm:p-10"
        >
          <h2
            id="overview-heading"
            className="mb-5 font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#a5b4fc]"
          >
            {title}
          </h2>
          <p className="text-[17px] leading-[1.75] text-[#d4d4d8]">{text}</p>
        </motion.div>
      </div>
    </section>
  );
}
