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

const previewImages = [
  '/images/sis_meditation.jpg',
  '/images/sis_breathwork.jpg',
  '/images/sis_heart.jpeg'
];

export default function HeroOption5() {
  const { currentSlide, setCurrentSlide } = useCarousel();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [setCurrentSlide]);

  return (
    <section className="h-screen min-h-[700px] bg-gray-100 relative overflow-hidden">
      {/* Demo Label */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
        OPTIE 5: Portfolio Grid System
      </div>

      <div className="grid grid-cols-12 grid-rows-12 h-full gap-0">
        
        {/* Zone 1: Main hero image (60%) - 8 cols x 8 rows */}
        <div className="col-span-8 row-span-8 relative overflow-hidden bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].alt}
                fill
                className="object-cover"
                style={{ animation: 'kenBurns 14s ease-in-out infinite alternate' }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/20" />
            </motion.div>
          </AnimatePresence>
          
          {/* Overlay text on image */}
          <div className="absolute bottom-8 left-8 text-white z-10">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              <p className="text-sm font-light tracking-wider uppercase mb-2">Featured Treatment</p>
              <h3 className="text-2xl font-libre font-light">Sacred Healing Session</h3>
            </motion.div>
          </div>
        </div>

        {/* Zone 2: Logo & Brand (40% top) - 4 cols x 8 rows */}
        <div className="col-span-4 row-span-8 bg-white flex flex-col justify-center p-8 lg:p-12">
          
          {/* Logo area */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="mb-8"
          >
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-pink-500 rounded-full mr-3" />
              <div className="w-2 h-2 bg-pink-300 rounded-full mr-2" />
              <div className="w-1 h-1 bg-pink-200 rounded-full" />
            </div>
            <h2 className="text-xs text-gray-500 tracking-widest uppercase mb-1">Holistische Praktijk</h2>
          </motion.div>

          {/* Main brand */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mb-8"
          >
            <h1 className="text-5xl lg:text-6xl font-libre font-extralight text-gray-900 leading-none mb-2">
              IM YOUR
            </h1>
            <h1 className="text-5xl lg:text-6xl font-libre font-light text-pink-600 leading-none">
              SIS
            </h1>
          </motion.div>

          {/* Navigation */}
          <motion.nav
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="space-y-3 mb-8"
          >
            <a href="#" className="block text-gray-600 hover:text-pink-600 transition-colors font-light">Services</a>
            <a href="#" className="block text-gray-600 hover:text-pink-600 transition-colors font-light">About</a>
            <a href="#" className="block text-gray-600 hover:text-pink-600 transition-colors font-light">Contact</a>
          </motion.nav>

          {/* CTA */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 text-sm font-medium transition-colors duration-300 w-fit"
          >
            Book Session
          </motion.button>
        </div>

        {/* Zone 3: Mini gallery (40% bottom) - 8 cols x 4 rows */}
        <div className="col-span-8 row-span-4 bg-gray-200 flex">
          {previewImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.2, duration: 0.8 }}
              className="flex-1 relative overflow-hidden group cursor-pointer"
            >
              <Image
                src={image}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-light">View {index + 1}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Zone 4: Info panel (remaining space) - 4 cols x 4 rows */}
        <div className="col-span-4 row-span-4 bg-pink-50 flex flex-col justify-center p-6">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <h3 className="text-lg font-libre font-medium text-gray-900 mb-3">Portfolio</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Rotating preview van behandelingen en healing sessies. Elk beeld vertelt een verhaal van transformatie.
            </p>
            <button className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors">
              View Gallery →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}