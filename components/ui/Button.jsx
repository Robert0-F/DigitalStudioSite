"use client";

import { motion, useReducedMotion } from "framer-motion";

const variants = {
  primary:
    "bg-teal text-white hover:bg-teal-deep shadow-soft hover:shadow-lift",
  secondary:
    "border border-[var(--border-strong)] bg-[var(--bg-card)] text-ink hover:border-teal hover:text-teal",
  ghost: "text-ink-muted hover:text-ink",
  inverse:
    "bg-[var(--bg-card)] text-ink hover:bg-cream-50 border border-transparent",
  signal:
    "bg-clay text-white hover:bg-[#9a4208] shadow-soft",
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
  const reduceMotion = useReducedMotion();
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold font-display tracking-tight transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:opacity-50 disabled:pointer-events-none";
  const classes = `${base} ${variants[variant] || variants.primary} ${className}`;
  const motionProps = reduceMotion
    ? {}
    : {
        whileHover: { scale: disabled ? 1 : 1.015 },
        whileTap: { scale: disabled ? 1 : 0.985 },
      };

  if (as === "a" && href) {
    return (
      <motion.a href={href} className={classes} {...motionProps} {...props}>
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
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  );
}
