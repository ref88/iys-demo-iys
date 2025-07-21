'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useCarousel } from '@/contexts/CarouselContext';
import Image from 'next/image';

interface QuoteProps {
  section: 'welcome' | 'services' | 'about' | 'contact' | 'reviews';
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
  ],
  reviews: [
    "Healing happens in community",
    "Your story matters and inspires others",
    "In sharing our truth, we find our power",
    "Every woman's journey is sacred"
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

export default function ContextualQuoteZen({ section }: QuoteProps) {
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
      contact: '/images/sis_breathwork.jpg',
      reviews: '/images/sis_heart.jpeg'
    };
    return images[section] || '/images/sis_heart.jpeg';
  };

  if (!quote) return null;

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Zen line */}
      <div className="flex justify-center mb-8">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 60, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1.5, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="h-[1px] bg-gray-400"
        />
      </div>

      <div className="max-w-4xl mx-auto px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          viewport={{ once: true, amount: 0.6 }}
          className="text-center"
        >
          <blockquote className="text-3xl md:text-5xl font-libre font-light leading-relaxed text-gray-800">
            <span className="text-5xl md:text-6xl leading-none opacity-20 text-gray-400">&ldquo;</span>
            <span className="block -mt-4 mb-2">{quote}</span>
            <span className="text-5xl md:text-6xl leading-none opacity-20 text-gray-400 float-right -mt-8">&rdquo;</span>
          </blockquote>
        </motion.div>
      </div>

      {/* Bottom zen line */}
      <div className="flex justify-center mt-8">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 40, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="h-[1px] bg-gray-400"
        />
      </div>
    </section>
  );
}