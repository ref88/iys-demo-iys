'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useCarousel } from '@/contexts/CarouselContext';

interface QuoteProps {
  section: 'welcome' | 'services' | 'about' | 'contact';
}

const quotePools = {
  welcome: [
    "Your womb is your center of creation and power"
  ],
  services: [
    "You are, because she is"
  ],
  about: [
    "Sisterhood is the healing balm the world needs",
    "When women support women, magic happens",
    "You are held by the love of all women before you",
    "In sacred circle, we remember who we are"
  ],
  contact: [
    "Your healing journey begins with a single step",
    "The courage to reach out is the courage to heal",
    "You don't have to walk this path alone",
    "Trauma passes on. So does healing"
  ]
};

// Get daily quote based on date and section
const getDailyQuote = (section: keyof typeof quotePools): string => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const quotes = quotePools[section];
  const index = (dayOfYear + section.length) % quotes.length;
  return quotes[index];
};

export default function ContextualQuote({ section }: QuoteProps) {
  const [quote, setQuote] = useState<string>('');
  const { currentSlide } = useCarousel();

  useEffect(() => {
    setQuote(getDailyQuote(section));
  }, [section]);

  // Get particle color based on current carousel slide
  const getParticleColor = () => {
    const colors = {
      0: 'bg-purple-300/30',
      1: 'bg-yellow-300/30', 
      2: 'bg-teal-300/30',
      3: 'bg-pink-300/30',
      4: 'bg-emerald-300/30',
      5: 'bg-purple-300/30'
    };
    return colors[currentSlide as keyof typeof colors] || 'bg-purple-300/30';
  };

  // Get background image based on section
  const getBackgroundImage = () => {
    const images = {
      welcome: '/images/sis_hands_circle.jpeg',
      services: '/images/sis_reiki.jpg',
      about: '/images/sis_meditation.jpg',
      contact: '/images/sis_breathwork.jpg'
    };
    return images[section] || '/images/sis_heart.jpeg';
  };

  if (!quote) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Subtle background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pink-200/30 rounded-full"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 12}%`,
              animation: `particleFloat ${8 + i * 2}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      {/* Carousel-synced particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 ${getParticleColor()} rounded-full transition-all duration-2000 ease-in-out`}
            style={{
              top: `${20 + i * 15}%`,
              right: `${10 + i * 12}%`,
              animation: `particleFloat ${10 + i * 3}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          viewport={{ once: true, amount: 0.6 }}
          className="text-center"
        >
          <div className="bg-white/60 backdrop-blur-[15px] border border-white/50 rounded-[30px] p-12 md:p-16 shadow-[0_15px_35px_rgba(0,0,0,0.08)]">
            <blockquote className="text-2xl sm:text-4xl md:text-6xl font-libre font-bold leading-tight" style={{color: '#674870'}}>
              <div className="text-center mb-4">
                <span className="text-4xl sm:text-6xl md:text-7xl leading-none opacity-30">&ldquo;</span>
              </div>
              <span className="block mb-10">{quote}</span>
              <div className="text-center">
                <span className="text-4xl sm:text-6xl md:text-7xl leading-none opacity-30">&rdquo;</span>
              </div>
            </blockquote>
          </div>
        </motion.div>
      </div>
    </section>
  );
}