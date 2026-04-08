import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Globe, Workflow, LayoutTemplate, Sparkles } from "lucide-react";

export const metadata = {
  title: "Услуги — веб, CRM, UI/UX, брендинг | Tagirov Digital Studio",
  description:
    "Полный цикл: сайты и платформы, CRM, продуктовый дизайн и брендинг. Премиальная студия для бизнеса.",
  openGraph: {
    title: "Услуги | Tagirov Digital Studio",
    description:
      "Веб, CRM, UI/UX и бренд — детальные страницы по каждому направлению.",
    type: "website",
    locale: "ru_RU",
  },
};

const list = [
  {
    href: "/services/web",
    title: "Веб и платформы",
    text: "Публичные и внутренние веб-продукты на современном стеке.",
    Icon: Globe,
  },
  {
    href: "/services/crm",
    title: "CRM и автоматизация",
    text: "Системы под вашу воронку и интеграции.",
    Icon: Workflow,
  },
  {
    href: "/services/ui-ux",
    title: "UI/UX дизайн",
    text: "Исследования, прототипы, дизайн-системы.",
    Icon: LayoutTemplate,
  },
  {
    href: "/services/brand",
    title: "Бренд и айдентика",
    text: "Стратегия, визуальный язык, гайдлайны.",
    Icon: Sparkles,
  },
];

export default function ServicesHubPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050508] pb-24 pt-32">
        <div className="section-padding">
          <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
            Направления
          </p>
          <h1 className="mb-4 max-w-2xl font-display text-4xl font-extrabold text-white sm:text-5xl">
            Услуги студии
          </h1>
          <p className="mb-14 max-w-xl text-lg text-[#9ca3af]">
            Выберите направление — на странице описан подход, процесс и формат
            сотрудничества.
          </p>
          <ul className="grid gap-6 sm:grid-cols-2">
            {list.map(({ href, title, text, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-2xl border border-white/[0.06] bg-[#0c0c12] p-8 transition-all hover:border-[#6366f1]/30 hover:shadow-glow-sm"
                >
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6366f1]/15 bg-[#6366f1]/10 text-[#a5b4fc]">
                    <Icon className="h-7 w-7" strokeWidth={1.25} />
                  </div>
                  <h2 className="mb-2 font-display text-xl font-bold text-white group-hover:text-[#c7d2fe]">
                    {title}
                  </h2>
                  <p className="mb-6 flex-1 text-sm text-[#9ca3af]">{text}</p>
                  <span className="text-sm font-semibold text-[#818cf8]">
                    Подробнее →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
