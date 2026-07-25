import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Beneficiaries } from "@/components/sections/Beneficiaries";
import { ClosingCTA } from "@/components/sections/ClosingCTA";
import { CognitiveScience } from "@/components/sections/CognitiveScience";
import { Consequences } from "@/components/sections/Consequences";
import { DecisionEnvironments } from "@/components/sections/DecisionEnvironments";
import { Disciplines } from "@/components/sections/Disciplines";
import { EducationGap } from "@/components/sections/EducationGap";
import { FAQ } from "@/components/sections/FAQ";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { JudgmentPortfolio } from "@/components/sections/JudgmentPortfolio";
import { JudgmentTerminal } from "@/components/sections/JudgmentTerminal";
import { KnowingDoingGap } from "@/components/sections/KnowingDoingGap";
import { Pricing } from "@/components/sections/Pricing";
import { Simulations } from "@/components/sections/Simulations";
import { WhyUniversities } from "@/components/sections/WhyUniversities";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <EducationGap />
        <KnowingDoingGap />
        <DecisionEnvironments />
        <HowItWorks />
        <Simulations />
        <JudgmentTerminal />
        <Consequences />
        <JudgmentPortfolio />
        <CognitiveScience />
        <Disciplines />
        <Beneficiaries />
        <WhyUniversities />
        <Pricing />
        <FAQ />
        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
}
