'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useCarousel } from '@/contexts/CarouselContext';
import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';

export default function QuoteSectionZen() {
  const { currentSlide } = useCarousel();
  const ref = useRef<HTMLElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Parallax effect for background image - only after hydration
  const { scrollYProgress } = useScroll({
    target: isMounted ? ref : undefined,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
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

  return (
    <section ref={ref} className="py-20 bg-white relative overflow-hidden">
      {/* Subtle parallax background image */}
      <div className="absolute inset-0">
        <motion.div 
          style={isMounted ? { y } : {}}
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
        >
          <Image
            src="/images/sis_cards_shuffle2.jpg"
            alt="Healing background"
            fill
            className="object-cover opacity-[0.03]"
            style={{ objectPosition: 'center' }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/90" />
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

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          viewport={{ once: true, amount: 0.6 }}
          className="text-center"
        >
          <div className="bg-white/80 backdrop-blur-[12px] border border-white/60 rounded-[25px] p-12 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <blockquote className="text-4xl md:text-6xl font-libre font-normal leading-tight" style={{color: '#674870'}}>
              <span className="text-6xl md:text-7xl leading-none opacity-30">&ldquo;</span>
              <span className="block -mt-4 mb-4">You are, because she is</span>
              <span className="text-6xl md:text-7xl leading-none opacity-30 float-right -mt-8">&rdquo;</span>
            </blockquote>
          </div>
        </motion.div>
      </div>
    </section>
  );
}