"use client";

import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-[#6366f1] text-white hover:bg-[#818cf8] shadow-glow-sm hover:shadow-glow",
  secondary:
    "border border-white/10 bg-white/[0.04] text-white backdrop-blur-sm hover:border-[#6366f1]/35 hover:bg-white/[0.07]",
  ghost: "text-[var(--text-muted)] hover:text-white",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  as = "button",
  href,
  onClick,
  type = "button",
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold font-display tracking-tight transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50 disabled:pointer-events-none";

  const classes = `${base} ${variants[variant] || variants.primary} ${className}`;

  if (as === "a" && href) {
    return (
      <motion.a
        href={href}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
