import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";

import { getCaseStudyBySlug, getAllCaseStudies } from "@/lib/caseStudies";
import { slugify } from "@/lib/slugify";
import CaseStudyPageClient from "@/components/caseStudy/CaseStudyPageClient";

/**
 * Dynamic case study page for Tagirov Digital Studio.
 * Data is currently loaded from a local file (`lib/caseStudies.js`).
 * Replace the data source with CMS/Supabase later.
 */

export async function generateMetadata({ params }) {
  const project = getCaseStudyBySlug(params.slug);

  if (!project) {
    return {
      title: "Кейс | Tagirov Digital Studio",
      description: "Подробности проекта.",
    };
  }

  const title = `${project.title} | Tagirov Digital Studio`;
  const description = String(project.valueStatement || project.overview || "")
    .trim()
    .slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ru_RU",
    },
  };
}

export default async function CaseStudyPage({ params }) {
  const caseStudy = getCaseStudyBySlug(slugify(params.slug));

  if (!caseStudy) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#050508] pt-28 pb-24">
          <article className="section-padding">
            <h1 className="heading-lg font-display font-bold text-white">
              Кейс не найден
            </h1>
            <p className="mt-4 text-[var(--text-muted)]">
              Запрос не соответствует существующим кейсам в демо-данных.
            </p>
          </article>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-[#050508] pt-28 pb-24">
        <CaseStudyPageClient caseStudy={caseStudy} />
        {/* Keep contact block available for CTA scroll on this page */}
        <Contact />
      </main>
      <Footer />
    </>
  );
}

// Optional: pre-render known slugs if you later switch to static generation.
// export function generateStaticParams() {
//   return getAllCaseStudies().map((c) => ({ slug: c.slug }));
// }

