'use client';

import { motion } from 'framer-motion';
import { useCarousel } from '@/contexts/CarouselContext';
import Image from 'next/image';

export default function RefinedDemo2() {
  const { currentSlide } = useCarousel();

  // Get edge gradient color based on current carousel slide
  const getEdgeGradient = () => {
    const gradients = {
      0: 'from-purple-200/30 via-transparent to-purple-200/30',
      1: 'from-yellow-200/30 via-transparent to-yellow-200/30', 
      2: 'from-teal-200/30 via-transparent to-teal-200/30',
      3: 'from-pink-200/30 via-transparent to-pink-200/30',
      4: 'from-emerald-200/30 via-transparent to-emerald-200/30',
      5: 'from-purple-200/30 via-transparent to-purple-200/30'
    };
    return gradients[currentSlide as keyof typeof gradients] || 'from-purple-200/30 via-transparent to-purple-200/30';
  };

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Option B: Edge-Only Glimpse */}
      <div className="absolute inset-0">
        <Image
          src="/images/sis_breathwork.jpg"
          alt="Healing background"
          fill
          className="object-cover opacity-[0.12]"
          style={{ objectPosition: 'center' }}
        />
        {/* Subtle gradient edges */}
        <div className={`absolute inset-0 bg-gradient-to-r ${getEdgeGradient()}`} />
        <div className={`absolute inset-0 bg-gradient-to-b ${getEdgeGradient()}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60" />
      </div>

      {/* Minimal geometric accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-10 w-20 h-20 border border-purple-200/20 rounded-full" />
        <div className="absolute bottom-1/4 left-10 w-16 h-16 border border-teal-200/20 rounded-full" />
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
          <div className="bg-purple-500/15 border-2 border-purple-500 rounded-[25px] p-4 mb-4">
            <h3 className="text-purple-700 font-bold">OPTION B: Edge-Only Glimpse</h3>
            <p className="text-sm text-purple-600">Opacity: 0.12 | Gradient edges | Geometric accents</p>
          </div>
          <div className="bg-white/85 backdrop-blur-[10px] border border-white/70 rounded-[25px] p-8 md:p-12 shadow-[0_15px_45px_rgba(0,0,0,0.06)]">
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