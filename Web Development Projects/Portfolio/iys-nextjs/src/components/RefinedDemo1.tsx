'use client';

import { motion } from 'framer-motion';
import { useCarousel } from '@/contexts/CarouselContext';
import Image from 'next/image';

export default function RefinedDemo1() {
  const { currentSlide } = useCarousel();

  // Get particle color based on current carousel slide
  const getParticleColor = () => {
    const colors = {
      0: 'bg-purple-300/20',
      1: 'bg-yellow-300/20', 
      2: 'bg-teal-300/20',
      3: 'bg-pink-300/20',
      4: 'bg-emerald-300/20',
      5: 'bg-purple-300/20'
    };
    return colors[currentSlide as keyof typeof colors] || 'bg-purple-300/20';
  };

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Option A: Ultra-Subtle Peek */}
      <div className="absolute inset-0">
        <Image
          src="/images/sis_hands_circle.jpeg"
          alt="Healing background"
          fill
          className="object-cover opacity-[0.18]"
          style={{ objectPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/65 to-white/70" />
      </div>

      {/* Subtle particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 ${getParticleColor()} rounded-full transition-all duration-2000 ease-in-out`}
            style={{
              top: `${25 + i * 20}%`,
              right: `${15 + i * 15}%`,
              animation: `particleFloat ${12 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.2}s`
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
          <div className="bg-blue-500/15 border-2 border-blue-500 rounded-[25px] p-4 mb-4">
            <h3 className="text-blue-700 font-bold">OPTION A: Ultra-Subtle Peek</h3>
            <p className="text-sm text-blue-600">Opacity: 0.18 | White overlay: 70% | Subtle visible texture</p>
          </div>
          <div className="bg-white/80 backdrop-blur-[10px] border border-white/60 rounded-[25px] p-8 md:p-12 shadow-[0_15px_45px_rgba(0,0,0,0.06)]">
            <blockquote className="text-2xl md:text-4xl font-libre font-normal leading-relaxed" style={{color: '#674870'}}>
              <span className="text-4xl md:text-5xl leading-none opacity-25">&ldquo;</span>
              <span className="block -mt-2 mb-2">You are, because she is</span>
              <span className="text-4xl md:text-5xl leading-none opacity-25 float-right -mt-6">&rdquo;</span>
            </blockquote>
          </div>
        </motion.div>
      </div>
    </section>
  );
}