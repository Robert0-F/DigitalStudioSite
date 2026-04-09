import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

async function fetchPublishedProjects() {
  const base = process.env.NEXT_PUBLIC_DJANGO_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${base}/api/portfolio`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    return json?.projects ?? [];
  } catch {
    return [];
  }
}

export default async function PortfolioPage() {
  const projects = await fetchPublishedProjects();

  return (
    <>
      <Header />
      <main className="bg-[#050508] pt-28 pb-24">
        <section className="section-padding">
          <div className="mb-12">
            <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
              Портфолио
            </p>
            <h1 className="heading-xl font-display font-bold text-white">
              Кейсы, которые дают бизнес-результат
            </h1>
            <p className="mt-4 max-w-2xl text-[var(--text-muted)] leading-relaxed">
              Мы проектируем цифровые решения под задачи компаний: от продающих сайтов и CRM до продуктового UI/UX и айдентики.
            </p>
          </div>

          {projects.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => {
                if (!p?.slug) return null;
                return (
                  <article
                    key={p.id}
                    className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c12] shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-[#6366f1]/30"
                  >
                    <Link href={`/portfolio/${p.slug}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-card)]">
                        {p.hero_image_url ? (
                          <Image
                            src={p.hero_image_url}
                            alt={p.title || "Проект"}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-white/[0.03]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                      </div>

                      <div className="p-6">
                        <p className="mb-2 text-xs font-display font-semibold uppercase tracking-wider text-[#a5b4fc]">
                          {p.client_industry || "Индустрия"}
                        </p>
                        <h2 className="font-display text-lg font-bold text-white group-hover:text-[#c7d2fe] transition-colors">
                          {p.title}
                        </h2>
                        {p.overview_excerpt ? (
                          <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-3">
                            {p.overview_excerpt}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c12] p-8">
              <p className="text-[var(--text-muted)]">
                Пока нет опубликованных кейсов. Добавьте проекты в админ-панели.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

