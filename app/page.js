import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import WorkingPrinciples from "@/components/WorkingPrinciples";
import Process from "@/components/Process";
import Pricing from "@/components/Pricing";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { SiteSettingsProvider } from "@/lib/SiteSettingsProvider";
import { fetchSiteSettingsServer } from "@/lib/mergeSiteSettings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await fetchSiteSettingsServer();

  return (
    <SiteSettingsProvider initialSettings={settings}>
      <Header />
      <main id="main-content">
        <Hero />
        <Services />
        <Portfolio />
        <WorkingPrinciples />
        <Process />
        <Pricing />
        <Reviews />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </SiteSettingsProvider>
  );
}
