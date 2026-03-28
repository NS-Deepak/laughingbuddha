'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertPreviewSection } from "@/components/marketing/home/AlertPreviewSection";
import { FeaturesSection } from "@/components/marketing/home/FeaturesSection";
import { FinalCtaSection } from "@/components/marketing/home/FinalCtaSection";
import { HeroSection } from "@/components/marketing/home/HeroSection";
import { HowItWorksSection } from "@/components/marketing/home/HowItWorksSection";
import { MarketingFooter } from "@/components/marketing/home/MarketingFooter";
import { MarketingNav } from "@/components/marketing/home/MarketingNav";
import { MetricsBand } from "@/components/marketing/home/MetricsBand";
import { PricingSection } from "@/components/marketing/home/PricingSection";
import "./marketing.css";

export default function MarketingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect to dashboard after sign-in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  const showBothButtons = !isLoaded;
  const showDashboardButton = showBothButtons || Boolean(isSignedIn);
  const showAuthButtons = showBothButtons || !isSignedIn;

  return (
    <div className="marketing-page">
      <MarketingNav showDashboardButton={showDashboardButton} showAuthButtons={showAuthButtons} />
      <HeroSection showDashboardButton={showDashboardButton} showAuthButtons={showAuthButtons} />
      <MetricsBand />
      <HowItWorksSection />
      <FeaturesSection />
      <AlertPreviewSection />
      <PricingSection />
      <FinalCtaSection showDashboardButton={showDashboardButton} showAuthButtons={showAuthButtons} />
      <MarketingFooter />
    </div>
  );
}
