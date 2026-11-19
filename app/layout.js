import fs from "fs";
import path from "path";
import { Manrope, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import YandexMetrika from "@/components/analytics/YandexMetrika";
import JsonLd from "@/components/seo/JsonLd";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tagirov Digital Studio — сайты, Django-системы, боты и маркетинг",
    template: "%s | Tagirov Digital Studio",
  },
  description:
    "Сайты на Tilda, веб-системы на Django, Telegram-боты и Яндекс.Директ под ключ для малого и среднего бизнеса. От идеи до заявок.",
  keywords: [
    "сайт на Tilda",
    "Django CRM",
    "Telegram бот для бизнеса",
    "Яндекс Директ",
    "веб-разработчик фрилансер",
  ],
  openGraph: {
    title: "Tagirov Digital Studio",
    description:
      "Разработка + маркетинг в одних руках: сайты, системы, боты и привлечение клиентов.",
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Tagirov Digital Studio",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
  other: {
    "format-detection": "telephone=no, date=no, email=no, address=no",
  },
};

function readBuiltCss() {
  try {
    return fs.readFileSync(path.join(process.cwd(), "public", "assets", "site.css"), "utf8");
  } catch {
    return "";
  }
}

export default function RootLayout({ children }) {
  // Phone often never requests external /_next/static/css or /assets/site.css.
  // One inlined copy (not experimental.inlineCss) keeps styles without a second request.
  const builtCss = readBuiltCss();

  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${ibmPlexSans.variable}`}
      style={{ colorScheme: "light only", backgroundColor: "#f3f0ea" }}
      suppressHydrationWarning
    >
      <body
        className="font-body antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
        style={{ backgroundColor: "#f3f0ea", color: "#171411" }}
        suppressHydrationWarning
      >
        {builtCss ? <style dangerouslySetInnerHTML={{ __html: builtCss }} /> : null}
        <a href="#main-content" className="skip-link">
          Перейти к содержимому
        </a>
        <JsonLd />
        {children}
        <YandexMetrika />
      </body>
    </html>
  );
}
