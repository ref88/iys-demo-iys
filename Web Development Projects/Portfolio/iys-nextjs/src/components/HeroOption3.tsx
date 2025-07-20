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

export default function HeroOption3() {
  const { currentSlide, setCurrentSlide } = useCarousel();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [setCurrentSlide]);

  return (
    <section className="h-screen min-h-[700px] bg-white relative overflow-hidden">
      {/* Demo Label */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
        OPTIE 3: Medical Professional Split
      </div>

      {/* Header strip (30%) */}
      <div className="h-[30%] bg-gray-50 border-b border-gray-200 flex items-center justify-between px-8 lg:px-16">
        {/* Logo left */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex items-center"
        >
          <div className="w-8 h-8 bg-teal-500 rounded mr-4" />
          <div>
            <h2 className="text-xl font-libre font-medium text-gray-900">Im Your SiS</h2>
            <p className="text-xs text-gray-500">Holistische Praktijk</p>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="hidden md:flex space-x-8"
        >
          <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">Services</a>
          <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">Over Mij</a>
          <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">Reviews</a>
          <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">Contact</a>
        </motion.nav>

        {/* Contact right */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-right"
        >
          <p className="text-sm font-medium text-gray-900">Bel nu</p>
          <p className="text-xs text-gray-500">+31 6 12345678</p>
        </motion.div>
      </div>

      {/* Main content (70%) */}
      <div className="h-[70%] flex">
        {/* Left: Carousel (50%) */}
        <div className="w-1/2 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].alt}
                fill
                className="object-cover"
                style={{ animation: 'kenBurns 8s ease-in-out infinite alternate' }}
                priority
              />
              <div className="absolute inset-0 bg-teal-900/10" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Content sections (50%) */}
        <div className="w-1/2 flex flex-col">
          {/* Services section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex-1 bg-white p-8 lg:p-12 border-b border-gray-100"
          >
            <h3 className="text-2xl font-libre font-medium text-gray-900 mb-4">Services</h3>
            <h1 className="text-4xl lg:text-5xl font-libre font-light text-teal-600 mb-4 leading-tight">
              IM YOUR SIS
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Professionele holistische behandelingen voor vrouwen
            </p>
          </motion.div>

          {/* About section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="flex-1 bg-gray-50 p-8 lg:p-12 border-b border-gray-100"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-3">Over de Praktijk</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Gespecialiseerd in baarmoeder healing, ademwerk en energetische behandelingen. 
              Een veilige ruimte waar jouw verhaal gehoord wordt.
            </p>
          </motion.div>

          {/* Action section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex-1 bg-teal-50 p-8 lg:p-12 flex flex-col justify-center"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Maak een Afspraak</h3>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 font-medium transition-colors duration-300 w-fit">
              Boek Nu
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}