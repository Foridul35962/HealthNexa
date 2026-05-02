import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import StatsSection from "@/components/home/StatsSection";
import MentalHealthSection from "@/components/home/MentalHealthSection";
import CommunityAlertsSection from "@/components/home/CommunityAlertsSection";
import B2BSection from "@/components/home/B2BSection";
import TrustSection from "@/components/home/TrustSection";

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <MentalHealthSection />
        <CommunityAlertsSection />
        <B2BSection />
        <TrustSection />
      </main>
    </>
  );
}
