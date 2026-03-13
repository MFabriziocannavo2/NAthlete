import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HighlightFeedPreview from "@/components/HighlightFeedPreview";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-20">
        <Navbar />
      </header>

      <div className="flex flex-col gap-0">
        <HeroSection />
        <FeaturesSection />
        <HighlightFeedPreview />
        <CTASection />
      </div>
    </main>
  );
}