"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Server,
  Search,
  Shield,
  Layers,
  FileJson,
  GitBranch,
  Bot,
  Plug,
  BarChart3,
  Clock,
  Smartphone,
} from "lucide-react";

const iconMap = {
  perf: Zap,
  be: Server,
  seo: Search,
  sec: Shield,
  scale: Layers,
  cms: FileJson,
  pipe: GitBranch,
  auto: Bot,
  int: Plug,
  analytics: BarChart3,
  history: Clock,
  mobile: Smartphone,
};

export default function ServiceFeatureGrid({ items, title }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="features-heading">
      <div className="section-padding">
        <motion.h2
          id="features-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 font-display text-2xl font-bold text-white sm:text-3xl"
        >
          {title}
        </motion.h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = iconMap[item.key] || Layers;
            return (
              <motion.li
                key={item.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05 }}
              >
                <article className="glass h-full rounded-xl border border-white/[0.06] p-6 transition-all duration-300 hover:border-[#6366f1]/25 hover:shadow-glow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#6366f1]/10 text-[#a5b4fc]">
                    <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3 className="mb-2 font-display font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#9ca3af]">
                    {item.text}
                  </p>
                </article>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
