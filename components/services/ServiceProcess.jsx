"use client";

import { motion } from "framer-motion";

export default function ServiceProcess({ title, steps }) {
  return (
    <section
      className="border-y border-white/[0.05] bg-[#08080c] py-16 sm:py-22"
      aria-labelledby="process-heading"
    >
      <div className="section-padding">
        <motion.h2
          id="process-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center font-display text-2xl font-bold text-white sm:text-3xl"
        >
          {title}
        </motion.h2>
        <div
          className={`mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 ${
            steps.length <= 4 ? "lg:grid-cols-4" : "lg:grid-cols-5"
          }`}
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="relative rounded-xl border border-white/[0.06] bg-[#0c0c12] p-5 text-center lg:text-left"
            >
              <span className="mb-3 inline-block font-display text-xs font-bold text-[#6366f1]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-2 font-display font-bold text-white">
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed text-[#9ca3af] sm:text-sm">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
