"use client";

import Image from "next/image";
import Link from "next/link";

const sizeClasses = {
  header: "h-8 w-auto max-w-[150px] sm:h-9 sm:max-w-[190px]",
  footer: "h-9 w-auto max-w-[180px] sm:h-10 sm:max-w-[220px]",
};

/**
 * Логотип студии (public/LogoWhite.png).
 * Скопируйте LogoWhite.png из RobertFile в public/, если его ещё нет.
 */
export default function SiteLogo({
  variant = "header",
  className = "",
  priority = false,
}) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366f1] ${className}`}
    >
      <Image
        src="/LogoWhite.png"
        alt="Tagirov Digital Studio"
        width={380}
        height={120}
        className={`${sizeClasses[variant] ?? sizeClasses.header} object-contain object-left`}
        priority={priority}
        sizes="(max-width: 640px) 150px, 220px"
      />
    </Link>
  );
}
