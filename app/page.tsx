import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HighlightFeedPreview from "@/components/HighlightFeedPreview";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />

      <div className="flex flex-col gap-0">
        <HeroSection />
        <FeaturesSection />
        <HighlightFeedPreview />
        <CTASection />
      </div>

      <Footer />
    </main>
  );
}