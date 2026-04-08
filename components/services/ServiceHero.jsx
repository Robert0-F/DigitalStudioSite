"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ServiceHero({ title, subtitle, cta, anchorId = "service-contact" }) {
  return (
    <section
      className="relative overflow-hidden border-b border-white/[0.06] bg-[#050508] pb-20 pt-32 sm:pb-28 sm:pt-40"
      aria-labelledby="service-hero-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_70%_-20%,rgba(99,102,241,0.12),transparent)]" />
      <div className="section-padding relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <Link
            href="/services"
            className="mb-8 inline-flex text-sm text-[#71717a] transition-colors hover:text-[#a5b4fc]"
          >
            ← Все услуги
          </Link>
          <h1
            id="service-hero-title"
            className="mb-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl"
          >
            {title}
          </h1>
          <p className="mb-10 text-lg font-light leading-relaxed text-[#9ca3af] sm:text-xl">
            {subtitle}
          </p>
          <Button as="a" href={`#${anchorId}`}>
            {cta}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
