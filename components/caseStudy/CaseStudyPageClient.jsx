import Link from "next/link";

import CaseStudyHero from "./CaseStudyHero";
import CaseStudyOverview from "./CaseStudyOverview";
import CaseStudyChallenge from "./CaseStudyChallenge";
import CaseStudySolution from "./CaseStudySolution";
import CaseStudyProcess from "./CaseStudyProcess";
import CaseStudyResults from "./CaseStudyResults";
import CaseStudyVisualShowcase from "./CaseStudyVisualShowcase";
import CaseStudyTechStack from "./CaseStudyTechStack";
import CaseStudyFinalCTA from "./CaseStudyFinalCTA";

export default function CaseStudyPageClient({ caseStudy }) {
  const showBackLink = caseStudy?.showBackLink !== false;

  return (
    <>
      {showBackLink ? (
        <div className="section-padding pt-6">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 text-sm text-[#9ca3af] hover:text-white link-underline"
          >
            ← Вернуться к портфолио
          </Link>
        </div>
      ) : null}

      <CaseStudyHero caseStudy={caseStudy} />
      <CaseStudyOverview caseStudy={caseStudy} />
      <CaseStudyChallenge caseStudy={caseStudy} />
      <CaseStudySolution caseStudy={caseStudy} />
      <CaseStudyProcess caseStudy={caseStudy} />
      <CaseStudyResults caseStudy={caseStudy} />
      <CaseStudyVisualShowcase caseStudy={caseStudy} />
      <CaseStudyTechStack caseStudy={caseStudy} />
      <CaseStudyFinalCTA caseStudy={caseStudy} />
    </>
  );
}

