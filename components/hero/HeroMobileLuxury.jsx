"use client";

import { motion } from "framer-motion";

export default function HeroMobileLuxury() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#050508]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_20%,rgba(99,102,241,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_60%,rgba(139,92,246,0.08),transparent)]" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.35]"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="lux" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {[...Array(12)].map((_, i) => (
          <motion.line
            key={i}
            x1={20 + (i * 7) % 60}
            y1={10 + i * 6}
            x2={75 - (i * 5) % 40}
            y2={85 - i * 4}
            stroke="url(#lux)"
            strokeWidth="0.08"
            initial={{ opacity: 0.15 }}
            animate={{ opacity: [0.12, 0.35, 0.12] }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[#6366f1]/25 bg-[#0c0c12]/80 shadow-[0_0_60px_rgba(99,102,241,0.15)]" />
      <motion.div
        className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 border border-violet-400/20"
        style={{ rotateX: 45, rotateZ: 45 }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
