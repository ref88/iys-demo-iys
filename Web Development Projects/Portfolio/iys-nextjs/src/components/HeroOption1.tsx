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

const services = [
  'Womb healing',
  'Breathwork',
  'Energy restoration',
  'Birth trauma therapy',
  'Fertility massage'
];

export default function HeroOption1() {
  const { currentSlide, setCurrentSlide } = useCarousel();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [setCurrentSlide]);

  return (
    <section className="h-screen min-h-[700px] bg-gray-50 relative overflow-hidden">
      {/* Demo Label */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
        OPTIE 1: Magazine Editorial Layout
      </div>

      <div className="flex h-full">
        {/* Left: Carousel Images (60%) */}
        <div className="w-3/5 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].alt}
                fill
                className="object-cover"
                style={{ animation: 'kenBurns 10s ease-in-out infinite alternate' }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/20" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Content (40%) */}
        <div className="w-2/5 bg-white flex flex-col justify-center px-12 lg:px-16">
          {/* Small logo area */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <div className="w-3 h-12 bg-purple-400 mb-2" />
            <p className="text-xs text-gray-500 tracking-widest uppercase">Holistische Praktijk</p>
          </motion.div>

          {/* Main brand */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-6xl lg:text-7xl font-libre font-light text-gray-900 leading-none mb-4">
              IM YOUR
            </h1>
            <h1 className="text-6xl lg:text-7xl font-libre font-bold text-purple-600 leading-none">
              SIS
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-8"
          >
            <p className="text-lg text-gray-700 font-libre leading-relaxed">
              Holistische baarmoederpraktijk waar jouw verhaal gehoord wordt
            </p>
          </motion.div>

          {/* Services preview */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mb-10"
          >
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Services</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <div className="w-1 h-1 bg-purple-400 rounded-full mr-3" />
                  {service}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 font-medium tracking-wide transition-colors duration-300">
              Boek Consultatie
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}