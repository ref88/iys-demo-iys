import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import HeroOption2 from '@/components/HeroOption2';
import WelcomeSection from '@/components/WelcomeSection';
import ContextualQuote from '@/components/ContextualQuote';
import HealingServicesSection from '@/components/HealingServicesSection';
import ReviewsSection from '@/components/ReviewsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { CarouselProvider } from '@/contexts/CarouselContext';

export default function Home() {
  return (
    <CarouselProvider>
      <main className="relative">
        <Header />
        
        {/* Original Hero with Particles & Sacred Elements */}
        <HeroCarousel />
        
        {/* Alternative Hero Layout */}
        <HeroOption2 />
        
        <ContextualQuote section="welcome" />
        <WelcomeSection />
        <ContextualQuote section="services" />
        <HealingServicesSection />
        <ContextualQuote section="contact" />
        <ReviewsSection />
        <ContextualQuote section="about" />
        
        
        <ContactSection />
        <Footer />
        
      </main>
    </CarouselProvider>
  );
}
