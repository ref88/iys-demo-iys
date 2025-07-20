'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarousel } from '@/contexts/CarouselContext';

interface Slide {
  id: number;
  image: string;
  alt: string;
}

const slides: Slide[] = [
  { id: 1, image: '/images/sis_reiki.jpg', alt: 'Reiki healing session' },
  { id: 2, image: '/images/sis_womb_massage.jpg', alt: 'Womb massage therapy' },
  { id: 3, image: '/images/sis_hands_circle.jpeg', alt: 'Sacred sisterhood circle' },
  { id: 4, image: '/images/sis_card.jpg', alt: 'Sacred oracle cards' },
  { id: 5, image: '/images/sis_sage.jpg', alt: 'Sacred sage cleansing ritual' },
  { id: 6, image: '/images/sis_heart.jpeg', alt: 'Heart-centered healing' }
];

export default function HeroOption4() {
  const { currentSlide, setCurrentSlide } = useCarousel();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [setCurrentSlide]);

  return (
    <section className="h-screen min-h-[700px] relative overflow-hidden bg-amber-50">
      {/* Demo Label */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
        OPTIE 4: Luxury Spa Asymmetric
      </div>

      {/* Diagonal split container */}
      <div className="relative h-full">
        {/* Hero image area (70% diagonal) */}
        <div 
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 0, 75% 0, 65% 100%, 0 100%)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].alt}
                fill
                className="object-cover"
                style={{ animation: 'kenBurns 12s ease-in-out infinite alternate' }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-amber-800/30" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Brand card area (30% diagonal) */}
        <div 
          className="absolute inset-0 bg-white"
          style={{
            clipPath: 'polygon(65% 0, 100% 0, 100% 100%, 75% 100%)'
          }}
        >
          <div className="h-full flex flex-col justify-center pl-[25%] pr-8 lg:pr-16">
            
            {/* Brand card */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 lg:p-12 max-w-md"
            >
              {/* Luxury accent line */}
              <div className="w-16 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 mb-6" />
              
              {/* Brand name */}
              <div className="mb-6">
                <h1 className="text-4xl lg:text-5xl font-libre font-extralight text-gray-900 leading-tight mb-2">
                  IM YOUR
                </h1>
                <h1 className="text-5xl lg:text-6xl font-libre font-light text-amber-700 leading-tight">
                  SIS
                </h1>
              </div>

              {/* Professional tagline */}
              <div className="mb-8">
                <p className="text-gray-600 text-sm font-medium tracking-wider uppercase mb-2">
                  Holistische Baarmoederpraktijk
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Luxe behandelingen in een serene omgeving waar jouw welzijn centraal staat.
                </p>
              </div>

              {/* Luxury button */}
              <button className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-4 font-light tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl">
                Reserveer Behandeling
              </button>
            </motion.div>

            {/* Floating accent elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="mt-8 space-y-4"
            >
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-amber-400 rounded-full mr-3" />
                Certified holistic practitioner
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-amber-400 rounded-full mr-3" />
                Safe & sacred space
              </div>
            </motion.div>
          </div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-12 h-12 border border-amber-300/30 rounded-full opacity-60" 
             style={{ animation: 'sacredFloat 20s ease-in-out infinite' }} />
        <div className="absolute bottom-1/3 right-1/6 w-8 h-8 border border-amber-400/40 rotate-45 opacity-40" 
             style={{ animation: 'sacredFloat 25s ease-in-out infinite', animationDelay: '5s' }} />
      </div>
    </section>
  );
}