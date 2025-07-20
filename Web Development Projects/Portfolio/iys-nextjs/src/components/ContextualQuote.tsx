'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

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
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: isMounted ? containerRef : undefined,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -125]);

  useEffect(() => {
    setQuote(getDailyQuote(section));
  }, [section]);

  // Get static gradient based on section instead of dynamic carousel
  const getSectionGradient = () => {
    const sectionGradients = {
      welcome: 'from-purple-500/70 via-purple-400/50 to-purple-300/30',
      services: 'from-teal-500/70 via-teal-400/50 to-teal-300/30', 
      contact: 'from-pink-400/70 via-pink-300/50 to-pink-200/30',
      about: 'from-emerald-600/70 via-emerald-500/50 to-emerald-400/30'
    };
    return sectionGradients[section] || 'from-purple-500/70 via-purple-400/50 to-purple-300/30';
  };

  const getSectionOverlay = () => {
    const sectionOverlays = {
      welcome: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(150, 106, 162, 0.6), rgba(150, 106, 162, 0))',
      services: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(62, 224, 207, 0.6), rgba(62, 224, 207, 0))',
      contact: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(244, 194, 194, 0.6), rgba(244, 194, 194, 0))',
      about: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(52, 168, 133, 0.6), rgba(52, 168, 133, 0))'
    };
    return sectionOverlays[section] || 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(150, 106, 162, 0.6), rgba(150, 106, 162, 0))';
  };

  // Get particle color based on section
  const getParticleColor = () => {
    const colors = {
      welcome: 'bg-purple-300/40',
      services: 'bg-teal-300/40',
      contact: 'bg-pink-300/40',
      about: 'bg-emerald-300/40'
    };
    return colors[section] || 'bg-purple-300/40';
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
    <section ref={containerRef} className="relative py-16 overflow-hidden">
      {/* Static Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${getBackgroundImage()})` }}
      />
      
      {/* Parallax Image Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 scale-150">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: `url(${getBackgroundImage()})` }}
          />
        </motion.div>
      </div>
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Hero-style gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getSectionGradient()}`} />
      <div 
        className="absolute inset-0" 
        style={{ background: getSectionOverlay() }}
      />

      {/* Section-specific particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 ${getParticleColor()} rounded-full`}
            style={{
              top: `${15 + i * 8}%`,
              left: `${5 + i * 8}%`,
              animation: `particleFloat ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
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
          <blockquote className="text-xl sm:text-2xl md:text-3xl font-libre font-bold leading-tight text-white text-center">
            <span className="text-2xl sm:text-3xl md:text-4xl leading-none opacity-60">&ldquo;</span>
            <span className="mx-2">{quote}</span>
            <span className="text-2xl sm:text-3xl md:text-4xl leading-none opacity-60">&rdquo;</span>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}