"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ServiceShowcaseGrid({ items, title = "Визуальные примеры" }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="showcase-heading">
      <div className="section-padding">
        <motion.h2
          id="showcase-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 font-display text-2xl font-bold text-white"
        >
          {title}
        </motion.h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {items.map((item, i) => (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="overflow-hidden rounded-2xl border border-white/[0.06]"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <p className="border-t border-white/[0.06] bg-[#0c0c12] px-4 py-3 text-center text-sm font-medium text-[#d4d4d8]">
                {item.label}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
