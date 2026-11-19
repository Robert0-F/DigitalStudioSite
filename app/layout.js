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
  // iOS Safari/Chrome auto-link phones/emails → hydration wipe → blank page
  other: {
    "format-detection": "telephone=no, date=no, email=no, address=no",
  },
};

/* Enough paint for Safari when /_next/static/css fails or is delayed */
const criticalCss = `
  html { color-scheme: light only; background-color: #f3f0ea; }
  body {
    margin: 0;
    min-height: 100%;
    background-color: #f3f0ea;
    color: #171411;
    font-family: var(--font-body), "IBM Plex Sans", system-ui, sans-serif;
    line-height: 1.5;
  }
  a { color: inherit; }
  img { max-width: 100%; height: auto; }
  #main-content { padding-bottom: 2rem; }
  .section-padding { padding-left: 1.25rem; padding-right: 1.25rem; }
  @media (min-width: 640px) {
    .section-padding { padding-left: 2rem; padding-right: 2rem; }
  }
  .heading-xl {
    font-family: var(--font-display), Manrope, system-ui, sans-serif;
    font-size: clamp(2rem, 5vw + 0.5rem, 3.5rem);
    line-height: 1.08;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0;
  }
  .heading-lg {
    font-family: var(--font-display), Manrope, system-ui, sans-serif;
    font-size: clamp(1.6rem, 3vw + 0.5rem, 2.4rem);
    line-height: 1.15;
    font-weight: 700;
    margin: 0;
  }
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${ibmPlexSans.variable}`}
      style={{ colorScheme: "light only", backgroundColor: "#f3f0ea" }}
      suppressHydrationWarning
    >
      <head>
        {/* Stable CSS URL — mobile often skips /_next/static/css (copied on build) */}
        <link rel="stylesheet" href="/assets/site.css" />
      </head>
      <body
        className="font-body antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
        style={{ backgroundColor: "#f3f0ea", color: "#171411" }}
        suppressHydrationWarning
      >
        {/* Critical paint before /assets/site.css arrives */}
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
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
