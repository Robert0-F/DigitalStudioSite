"use client";

import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/siteContent";
import useSiteSettings from "@/lib/useSiteSettings";

const DEFAULT_LOGO = "/brand/logo-tagirov-black.svg";

/**
 * Логотип: загруженный из админки → SVG из /public/brand → текстовый fallback.
 */
export default function SiteLogo({
  variant = "header",
  className = "",
  priority = false,
}) {
  const { settings } = useSiteSettings();
  const logoSrc = settings.logoUrl || DEFAULT_LOGO;
  const isSvg =
    !settings.logoUrl ||
    /\.svg(\?|$)/i.test(logoSrc) ||
    logoSrc.startsWith("data:image/svg");
  const isFooter = variant === "footer";

  // Header: прежний размер hero (h-10 / sm:h-12). Footer чуть компактнее.
  const imgClass = isFooter ? "h-8 w-auto sm:h-9" : "h-10 w-auto sm:h-12";

  const mark = (
    <>
      {isSvg ? (
        // SVG: next/image капризничает — обычный img надёжнее
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc}
          alt={brand.name}
          className={`${imgClass} object-contain object-left`}
          width={200}
          height={40}
        />
      ) : (
        <Image
          src={logoSrc}
          alt={brand.name}
          width={220}
          height={48}
          className={`${imgClass} object-contain object-left`}
          priority={priority}
        />
      )}
    </>
  );

  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${className}`}
      aria-label={brand.name}
    >
      {mark}
    </Link>
  );
}
