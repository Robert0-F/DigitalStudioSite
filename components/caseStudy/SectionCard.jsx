"use client";

export default function SectionCard({ className = "", children }) {
  return (
    <section
      className={`glass-strong rounded-2xl border border-white/[0.06] p-6 sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

