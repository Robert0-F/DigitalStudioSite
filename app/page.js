import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Trust from "@/components/Trust";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Process from "@/components/Process";
import WorkingPrinciples from "@/components/WorkingPrinciples";
import PremiumCTA from "@/components/PremiumCTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Trust />
        <Services />
        <Portfolio />
        <Process />
        <WorkingPrinciples />
        <PremiumCTA />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
