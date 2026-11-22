import FeaturesSection from "../components/onboarding/FeaturesSection";
import FinalCtaSection from "../components/onboarding/FinalCtaSection";
import HeroSection from "../components/onboarding/HeroSection";
import OnboardingFooter from "../components/onboarding/OnboardingFooter";
import OnboardingHeader from "../components/onboarding/OnboardingHeader";

function Onboarding() {
  return (
    <div className="min-h-svh bg-white">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-brand-950 focus:shadow-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
      >
        Pular para o conteúdo
      </a>

      <OnboardingHeader />

      <main id="conteudo" tabIndex={-1} className="focus:outline-none">
        <HeroSection />
        <FeaturesSection />
        <FinalCtaSection />
      </main>

      <OnboardingFooter />
    </div>
  );
}

export default Onboarding;
