import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import WelcomeSection from '@/components/WelcomeSection';
import QuoteSection from '@/components/QuoteSection';
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
        <HeroCarousel />
        <ContextualQuote section="welcome" />
        <WelcomeSection />
        <QuoteSection />
        <HealingServicesSection />
        <ReviewsSection />
        <ContextualQuote section="contact" />
        <ContactSection />
        <Footer />
        
      </main>
    </CarouselProvider>
  );
}
