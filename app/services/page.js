import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { LayoutTemplate, Database, Bot, Megaphone, ArrowUpRight } from "lucide-react";
import IconBox from "@/components/ui/IconBox";
import { services } from "@/lib/siteContent";

export const metadata = {
  title: "Услуги",
  description: "Tilda, Django, Telegram-боты и маркетинг в Яндексе.",
};

const icons = {
  tilda: LayoutTemplate,
  django: Database,
  telegram: Bot,
  marketing: Megaphone,
};

export default function ServicesIndexPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="bg-cream-100 pb-24 pt-28">
        <section className="section-padding">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Услуги</p>
          <h1 className="heading-xl text-ink">Четыре направления под заявки</h1>
          <p className="mt-4 max-w-2xl text-ink-muted">
            Выберите направление — или напишите задачу целиком, разберём вместе.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {services.map((s) => {
              const Icon = icons[s.id] || LayoutTemplate;
              return (
                <li key={s.id}>
                  <Link
                    href={s.href}
                    className="group surface-card flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    <IconBox>
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </IconBox>
                    <h2 className="heading-md mt-5 text-ink group-hover:text-teal">{s.title}</h2>
                    <p className="mt-3 flex-1 text-sm text-ink-muted">{s.outcome}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal">
                      Смотреть услугу
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
