'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  id: number;
  image: string;
  gradient: string;
  alt: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/images/sis_reiki.jpg',
    gradient: 'from-purple-500/70 via-purple-400/50 to-purple-300/30',
    alt: 'Reiki healing session'
  },
  {
    id: 2,
    image: '/images/sis_womb_massage.jpg',
    gradient: 'from-yellow-600/70 via-yellow-500/50 to-yellow-400/30',
    alt: 'Womb massage therapy'
  },
  {
    id: 3,
    image: '/images/sis_hands_circle.jpeg',
    gradient: 'from-teal-500/70 via-teal-400/50 to-teal-300/30',
    alt: 'Sacred sisterhood circle'
  },
  {
    id: 4,
    image: '/images/sis_card.jpg',
    gradient: 'from-pink-400/70 via-pink-300/50 to-pink-200/30',
    alt: 'Sacred oracle cards'
  },
  {
    id: 5,
    image: '/images/sis_heart.jpeg',
    gradient: 'from-purple-500/70 via-purple-400/50 to-purple-300/30',
    alt: 'Heart-centered healing'
  }
];

// Generate random particles on client side
const generateRandomParticles = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5, // Random delay between 0-5 seconds
    position: { 
      top: Math.random() * 90 + 5, // Random position between 5-95%
      left: Math.random() * 90 + 5 
    },
    duration: 12 + Math.random() * 8, // Random duration between 12-20 seconds
    opacity: 0.3 + Math.random() * 0.4 // Random opacity between 0.3-0.7
  }));
};

// Fire-like particles that rise before slide transition
const fireParticles = [
  { id: 'fire1', position: { bottom: 10, left: 15 } },
  { id: 'fire2', position: { bottom: 5, left: 25 } },
  { id: 'fire3', position: { bottom: 15, left: 35 } },
  { id: 'fire4', position: { bottom: 8, left: 65 } },
  { id: 'fire5', position: { bottom: 12, left: 75 } },
  { id: 'fire6', position: { bottom: 6, left: 85 } },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFireParticles, setShowFireParticles] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    delay: number;
    position: { top: number; left: number };
    duration: number;
    opacity: number;
  }>>([]);

  // Initialize random particles on mount
  useEffect(() => {
    setParticles(generateRandomParticles());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      // Fire particles activeren 2 seconden voor slide transitie
      setShowFireParticles(true);
      
      // Na 2 seconden: transitie naar volgende slide
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        // Fire particles uitschakelen na transitie
        setTimeout(() => setShowFireParticles(false), 1000);
      }, 2000);
    }, 12000); // Rustiger - was 8000ms, nu 12000ms

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen min-h-[700px] overflow-hidden bg-gradient-to-br from-black to-gray-900">
      {/* Ambient Glow Effect */}
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-ambient-pulse pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-radial from-iys-pink/8 via-transparent to-transparent" 
             style={{ background: 'radial-gradient(circle at 25% 25%, rgba(212, 165, 165, 0.04) 0%, transparent 35%)' }} />
        <div className="absolute inset-0 bg-gradient-radial from-iys-green/6 via-transparent to-transparent" 
             style={{ background: 'radial-gradient(circle at 75% 75%, rgba(168, 181, 160, 0.03) 0%, transparent 35%)' }} />
      </div>

      {/* Aurora Effect */}
      <div className="absolute inset-0 animate-aurora-move pointer-events-none z-[1]"
           style={{ 
             background: 'linear-gradient(45deg, transparent 0%, rgba(212, 165, 165, 0.02) 25%, transparent 50%, rgba(168, 181, 160, 0.02) 75%, transparent 100%)'
           }} />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-[2]">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white/40 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.3)]"
            style={{
              top: `${particle.position.top}%`,
              left: `${particle.position.left}%`,
              opacity: particle.opacity,
              animation: `particleFloat ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Fire-like particles (voor transitie effect) */}
      {showFireParticles && (
        <div className="absolute inset-0 pointer-events-none z-[3]">
          {fireParticles.map((fireParticle) => (
            <div
              key={fireParticle.id}
              className="absolute w-1 h-1 bg-orange-400/60 rounded-full shadow-[0_0_8px_rgba(255,165,0,0.8)]"
              style={{
                bottom: `${fireParticle.position.bottom}%`,
                left: `${fireParticle.position.left}%`,
                animation: `fireRise 2s ease-out forwards`
              }}
            />
          ))}
        </div>
      )}

      {/* Carousel Images */}
      <div className="relative h-full z-[1]">
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div className="relative h-full">
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].alt}
                fill
                className="object-cover"
                style={{
                  animation: 'kenBurns 8s ease-in-out infinite alternate'
                }}
                priority
              />
              {/* Gradient Overlay - links transparant naar rechts donkerder */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black/60" />
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-current opacity-60`} style={{
                background: slides[currentSlide].id === 1 ? 'linear-gradient(to right, transparent, rgba(150, 106, 162, 0.8))' :
                           slides[currentSlide].id === 2 ? 'linear-gradient(to right, transparent, rgba(180, 144, 48, 0.8))' :
                           slides[currentSlide].id === 3 ? 'linear-gradient(to right, transparent, rgba(62, 224, 207, 0.8))' :
                           slides[currentSlide].id === 4 ? 'linear-gradient(to right, transparent, rgba(244, 194, 194, 0.8))' :
                           'linear-gradient(to right, transparent, rgba(150, 106, 162, 0.8))'
              }} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Text Overlay */}
      <div className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 z-[5] text-center w-[90%] max-w-[700px]">
        <div className="bg-white/10 backdrop-blur-[20px] border border-white/20 rounded-[25px] p-8 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-white text-3xl md:text-4xl mb-5 font-normal font-libre"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
          >
            Welkom bij holistische baarmoederpraktijk
          </motion.h1>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-white text-4xl md:text-6xl mb-4 font-libre font-bold"
            style={{ textShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
          >
            Im Your SiS
          </motion.h2>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-white/90 text-lg md:text-xl italic font-dancing"
          >
            Waar jouw baarmoeder gehoord wordt.
          </motion.p>
        </div>
      </div>

      {/* Indicators verwijderd zoals gewenst */}
    </div>
  );
}