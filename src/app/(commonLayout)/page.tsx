import { Features } from "@/components/modules/Home/Features";
import { Footer } from "@/components/modules/Home/Footer";
import { HeroSection } from "@/components/modules/Home/HeroSection";
import { HowItWorks } from "@/components/modules/Home/HowItWorks";
import { Testimonials } from "@/components/modules/Home/Testimonials";


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col mx-auto">
     <HeroSection />
     <Features />
     <HowItWorks />
     <Testimonials/>
     <Footer />
    </div>
  );
}
