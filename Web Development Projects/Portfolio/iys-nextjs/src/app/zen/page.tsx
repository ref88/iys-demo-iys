import HeroZen from '@/components/HeroZen';
import WelcomeSectionZen from '@/components/WelcomeSectionZen';
import ContextualQuoteZen from '@/components/ContextualQuoteZen';
import HealingServicesSectionZen from '@/components/HealingServicesSectionZen';
import ReviewsZen from '@/components/ReviewsZen';
import ContactSectionZen from '@/components/ContactSectionZen';
import FooterZen from '@/components/FooterZen';
import { CarouselProvider } from '@/contexts/CarouselContext';

export default function ZenPage() {
  return (
    <CarouselProvider>
      <main className="relative bg-white">
        {/* Zen Hero with integrated header */}
        <HeroZen />
        
        <ContextualQuoteZen section="welcome" />
        <div id="about">
          <WelcomeSectionZen />
        </div>
        
        <ContextualQuoteZen section="services" />
        <div id="services">
          <HealingServicesSectionZen version="sacred" />
        </div>
        
        <ContextualQuoteZen section="reviews" />
        <div id="reviews">
          <ReviewsZen />
        </div>
        
        <ContextualQuoteZen section="contact" />
        <div id="contact">
          <ContactSectionZen />
        </div>
        
        <FooterZen />
      </main>
    </CarouselProvider>
  );
}