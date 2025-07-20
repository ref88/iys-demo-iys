'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarousel } from '@/contexts/CarouselContext';
import HeaderZen from '@/components/HeaderZen';

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

export default function HeroOption2() {
  const { currentSlide, setCurrentSlide } = useCarousel();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [setCurrentSlide]);

  return (
    <section className="h-screen min-h-[700px] relative overflow-hidden bg-white">
      {/* Zen Header */}
      <HeaderZen />

      {/* Background: Rotating carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].alt}
              fill
              className="object-cover"
              style={{ animation: 'kenBurns 15s ease-in-out infinite alternate' }}
              priority
            />
            <div className="absolute inset-0 bg-white/85" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Centered content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-8">
        {/* Zen line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 80, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1.5, ease: "easeInOut" }}
          className="h-[1px] bg-gray-400 mb-8"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="text-sm text-gray-600 font-light tracking-[0.3em] uppercase mb-12"
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
          <h1 className="text-8xl lg:text-9xl xl:text-[12rem] font-libre font-extralight text-gray-900 leading-none tracking-tight">
            IM YOUR
          </h1>
          <h1 className="text-8xl lg:text-9xl xl:text-[12rem] font-libre font-light text-gray-800 leading-none tracking-tight -mt-4">
            SIS
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 1.2 }}
          className="text-xl lg:text-2xl text-gray-700 font-light leading-relaxed mb-16 max-w-2xl"
        >
          Waar jouw baarmoeder gehoord wordt
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.2 }}
        >
          <button className="border-2 border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white px-12 py-4 font-light tracking-wide transition-all duration-500">
            Maak Afspraak
          </button>
        </motion.div>

        {/* Bottom zen line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 60, opacity: 1 }}
          transition={{ delay: 1.8, duration: 1.5, ease: "easeInOut" }}
          className="h-[1px] bg-gray-400 mt-16"
        />
      </div>
    </section>
  );
}