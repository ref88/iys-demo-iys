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
        <div id="about">
          <WelcomeSection />
        </div>
        <ContextualQuote section="services" />
        <div id="services">
          <HealingServicesSection version="eventFocus" />
        </div>
        <ContextualQuote section="contact" />
        <div id="reviews">
          <ReviewsSection />
        </div>
        <ContextualQuote section="about" />
        
        <div id="contact">
          <ContactSection />
        </div>
        <Footer />
        
      </main>
    </CarouselProvider>
  );
}
