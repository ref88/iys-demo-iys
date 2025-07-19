import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import WelcomeSection from '@/components/WelcomeSection';

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <HeroCarousel />
      <WelcomeSection />
      
    </main>
  );
}
