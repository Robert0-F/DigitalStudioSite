"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ServiceCaseCards({ cases: caseItems, title = "Примеры" }) {
  const list = Array.isArray(caseItems) ? caseItems : [];
  if (!list.length) return null;
  return (
    <section className="py-16 sm:py-20" aria-labelledby="cases-heading">
      <div className="section-padding">
        <motion.h2
          id="cases-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 font-display text-2xl font-bold text-white sm:text-3xl"
        >
          {title}
        </motion.h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {list.map((c, i) => (
            <motion.li
              key={c.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={c.href}
                className="group block overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c12] transition-all hover:border-[#6366f1]/30 hover:shadow-depth"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-80" />
                </div>
                <div className="flex items-start justify-between gap-4 p-6">
                  <div>
                    <h3 className="mb-2 font-display font-bold text-white group-hover:text-[#c7d2fe]">
                      {c.title}
                    </h3>
                    <p className="text-sm text-[#9ca3af]">{c.text}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-[#6366f1] opacity-60 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
