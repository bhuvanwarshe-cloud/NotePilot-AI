import { HeroSection } from './Landing/components/HeroSection';
import { TrustedBySection } from './Landing/components/TrustedBySection';
import { FeaturesSection } from './Landing/components/FeaturesSection';
import { HowItWorksSection } from './Landing/components/HowItWorksSection';
import { ExamModeSection } from './Landing/components/ExamModeSection';
import { SocialProofSection } from './Landing/components/SocialProofSection';
import { PricingSection } from './Landing/components/PricingSection';
import { FAQSection } from './Landing/components/FAQSection';
import { CTASection } from './Landing/components/CTASection';

export function LandingPage() {
  return (
    <div className="w-full h-full flex flex-col">
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <HowItWorksSection />
      <ExamModeSection />
      <SocialProofSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
