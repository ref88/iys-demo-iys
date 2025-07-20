'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarousel } from '@/contexts/CarouselContext';
import Header from '@/components/Header';

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
    image: '/images/sis_sage.jpg',
    gradient: 'from-emerald-600/70 via-emerald-500/50 to-emerald-400/30',
    alt: 'Sacred sage cleansing ritual'
  },
  {
    id: 6,
    image: '/images/sis_heart.jpeg',
    gradient: 'from-purple-500/70 via-purple-400/50 to-purple-300/30',
    alt: 'Heart-centered healing'
  }
];

// Generate random particles on client side
const generateRandomParticles = () => {
  return Array.from({ length: 25 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5, // Random delay between 0-5 seconds
    position: { 
      top: Math.random() * 90 + 5, // Random position between 5-95%
      left: Math.random() * 90 + 5 
    },
    duration: 12 + Math.random() * 8, // Random duration between 12-20 seconds
    opacity: 0.3 + Math.random() * 0.4, // Random opacity between 0.3-0.7
    shouldFlicker: true // All particles can flicker when triggered
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
  const { currentSlide, setCurrentSlide } = useCarousel();
  const [showFireParticles, setShowFireParticles] = useState(false);
  const [shouldFlicker, setShouldFlicker] = useState(false);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [particles, setParticles] = useState<Array<{
    id: number;
    delay: number;
    position: { top: number; left: number };
    duration: number;
    opacity: number;
    shouldFlicker: boolean;
  }>>([]);

  const services = [
    { title: "Womb Healing & Care", description: "Verbinding met je tweede brein" },
    { title: "Energetic Healing", description: "Reiki-infused energiebalans" },
    { title: "Breathwork", description: "Transformerende ademkracht" },
    { title: "Retreats", description: "Transformerende reizen" },
    { title: "Workshops", description: "Leren en groeien samen" }
  ];

  // Initialize random particles on mount
  useEffect(() => {
    setParticles(generateRandomParticles());
  }, []);

  // Simple carousel timer - ONLY handles slide changes
  useEffect(() => {
    const carouselTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(carouselTimer);
  }, [setCurrentSlide]);

  // Independent fire particles timer
  useEffect(() => {
    const fireTimer = setInterval(() => {
      setShowFireParticles(true);
      setShouldFlicker(true);
      
      setTimeout(() => {
        setShowFireParticles(false);
        setShouldFlicker(false);
      }, 2000);
    }, 6000);

    return () => clearInterval(fireTimer);
  }, []);

  // Update service index when carousel slide changes - sync exactly with carousel
  useEffect(() => {
    setCurrentServiceIndex(currentSlide % services.length);
  }, [currentSlide, services.length]);

  return (
    <div className="relative h-screen min-h-[700px] overflow-hidden bg-gradient-to-br from-black to-gray-900">
      {/* Header */}
      <Header />
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
              animationName: shouldFlicker 
                ? 'particleFloat, particleFlicker'
                : 'particleFloat',
              animationDuration: shouldFlicker 
                ? `${particle.duration}s, 1s`
                : `${particle.duration}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
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
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-current`} style={{
                background: slides[currentSlide].id === 1 ? 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(150, 106, 162, 0.6), rgba(150, 106, 162, 0))' :
                           slides[currentSlide].id === 2 ? 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(180, 144, 48, 0.6), rgba(180, 144, 48, 0))' :
                           slides[currentSlide].id === 3 ? 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(62, 224, 207, 0.6), rgba(62, 224, 207, 0))' :
                           slides[currentSlide].id === 4 ? 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(244, 194, 194, 0.6), rgba(244, 194, 194, 0))' :
                           slides[currentSlide].id === 5 ? 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(52, 168, 133, 0.6), rgba(52, 168, 133, 0))' :
                           'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(150, 106, 162, 0.6), rgba(150, 106, 162, 0))'
              }} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Text Overlay - Zen Typography Style */}
      <div className="absolute inset-0 z-[5] flex flex-col justify-center items-center text-center px-8">
        {/* Zen line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 80, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1.5, ease: "easeInOut" }}
          className="h-[1px] bg-white/60 mb-8"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="text-sm text-white/70 font-light tracking-[0.3em] uppercase mb-12 font-libre"
        >
          Holistische Praktijk
        </motion.p>

        {/* Main title - mega groot */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 1.5 }}
          className="mb-16"
        >
          <h1 className="text-8xl lg:text-9xl xl:text-[12rem] font-libre font-extralight text-white leading-none tracking-tight">
            IM YOUR
          </h1>
          <h1 className="text-8xl lg:text-9xl xl:text-[12rem] font-libre font-light text-white leading-none tracking-tight -mt-4">
            SIS
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 1.2 }}
          className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed mb-16 max-w-2xl font-libre"
        >
          Waar jouw baarmoeder gehoord wordt
        </motion.p>

        {/* Service Information Display */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.2 }}
          className="h-16 flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`service-info-${currentServiceIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="text-center text-white"
            >
              <h3 className="text-xl font-libre font-light mb-2">
                {services[currentServiceIndex].title}
              </h3>
              <p className="text-lg font-dancing italic opacity-80">
                {services[currentServiceIndex].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Bottom zen line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 60, opacity: 1 }}
          transition={{ delay: 1.8, duration: 1.5, ease: "easeInOut" }}
          className="h-[1px] bg-white/60 mt-16"
        />
      </div>

      {/* Static Service List */}
      <div className="absolute bottom-8 right-8 z-[6] hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="text-white/80 font-libre font-light text-sm tracking-wide"
        >
          <p className="text-right leading-relaxed">
            Womb Healing & Care • Energetic Healing •<br />
            Breathwork • Retreats • Workshops
          </p>
        </motion.div>
      </div>

      {/* Indicators verwijderd zoals gewenst */}
    </div>
  );
}