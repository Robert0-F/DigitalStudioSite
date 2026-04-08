import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext", "cyrillic-ext"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: {
    default:
      "Tagirov Digital Studio — цифровые продукты, CRM, UI/UX и брендинг",
    template: "%s | Tagirov Digital Studio",
  },
  description:
    "Премиальная студия: сайты, CRM-системы, продуктовый UI/UX и брендинг для бизнеса с инвестициями от $5k. Архитектура, код и дизайн уровня enterprise.",
  keywords: [
    "digital agency",
    "веб-разработка премиум",
    "CRM под ключ",
    "UI UX агентство",
    "брендинг b2b",
  ],
  openGraph: {
    title: "Tagirov Digital Studio",
    description:
      "Цифровые системы для компаний, которые строят продукт на годы.",
    type: "website",
    locale: "ru_RU",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="font-body font-light antialiased min-h-screen bg-[#050508] text-[#f4f4f5]">
        {children}
      </body>
    </html>
  );
}
