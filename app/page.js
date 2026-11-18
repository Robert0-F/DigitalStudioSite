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

export default function Home() {
  return (
    <>
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
    </>
  );
}
