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

const criticalCss = `
  :root {
    --bg-primary: #f3f0ea;
    --bg-card: #fffbf7;
    --bg-secondary: #e8e2d8;
    --text-primary: #171411;
    --text-muted: #5c564e;
    --accent: #0f5c4c;
    --border-soft: rgba(23, 20, 17, 0.1);
  }
  html { color-scheme: light only; background: #f3f0ea; }
  body {
    margin: 0;
    min-height: 100%;
    background: #f3f0ea;
    color: #171411;
    font-family: var(--font-body), "IBM Plex Sans", system-ui, sans-serif;
    line-height: 1.5;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; height: auto; display: block; }
  header { position: sticky; top: 0; z-index: 40; background: rgba(255,251,247,0.92); }
  #main-content { padding-bottom: 2rem; }
  .section-padding { box-sizing: border-box; margin: 0 auto; width: 100%; max-width: 1200px; padding-left: 1.25rem; padding-right: 1.25rem; }
  .section-y { padding-top: 3.5rem; padding-bottom: 3.5rem; }
  .paper-hero {
    background: linear-gradient(180deg, #f3f0ea 0%, #e8e2d8 100%);
    padding-top: 6rem;
    padding-bottom: 2.5rem;
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
  .chip-accent {
    display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    background: #d7ebe4;
    color: #0f5c4c;
  }
  .text-ink-muted, .text-ink-muted * { color: #5c564e; }
  button, .btn {
    font: inherit;
    cursor: pointer;
    border-radius: 0.75rem;
    padding: 0.75rem 1.1rem;
    border: 1px solid transparent;
    background: #0f5c4c;
    color: #fff;
  }
  details > summary { list-style: none; }
  details > summary::-webkit-details-marker { display: none; }
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
        <link rel="stylesheet" href="/assets/site.css" />
      </head>
      <body
        className="font-body antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
        style={{ backgroundColor: "#f3f0ea", color: "#171411" }}
        suppressHydrationWarning
      >
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
