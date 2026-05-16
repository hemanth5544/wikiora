import { LandingCtaBand } from "@/components/landing/LandingCtaBand"
import { LandingFeatureBento } from "@/components/landing/LandingFeatureBento"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { LandingHero } from "@/components/landing/LandingHero"
import { LandingNav } from "@/components/landing/LandingNav"
import { LandingProductPreview } from "@/components/landing/LandingProductPreview"
import { LandingTrustSection } from "@/components/landing/LandingTrustSection"

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-background">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingProductPreview />
        <LandingFeatureBento />
        <LandingTrustSection />
        <LandingCtaBand />
      </main>
      <LandingFooter />
    </div>
  )
}
