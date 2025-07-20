'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function RefinedDemo3() {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Option C: Geometric Minimalism */}
      <div className="absolute inset-0">
        <Image
          src="/images/sis_meditation.jpg"
          alt="Healing background"
          fill
          className="object-cover opacity-[0.10]"
          style={{ objectPosition: 'center' }}
        />
        {/* Abstract geometric patterns - HIGHLY VISIBLE */}
        <div className="absolute inset-0">
          {/* Bold visible lines */}
          <div className="absolute top-20 left-20 w-40 h-[4px] bg-gradient-to-r from-transparent via-purple-400/80 to-transparent rotate-45 shadow-lg" />
          <div className="absolute top-40 right-32 w-32 h-[4px] bg-gradient-to-r from-transparent via-teal-400/70 to-transparent -rotate-45 shadow-lg" />
          <div className="absolute bottom-32 left-32 w-36 h-[4px] bg-gradient-to-r from-transparent via-pink-400/60 to-transparent rotate-12 shadow-lg" />
          
          {/* Large visible geometric shapes with animation */}
          <div className="absolute top-1/3 right-1/4 w-16 h-16 border-4 border-purple-400/70 rotate-45 shadow-2xl" style={{animation: 'geometricPulse 8s ease-in-out infinite'}} />
          <div className="absolute bottom-1/3 left-1/4 w-14 h-14 border-4 border-teal-400/65 rounded-full shadow-2xl" style={{animation: 'geometricPulse 10s ease-in-out infinite', animationDelay: '2s'}} />
          <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-pink-400/50 rotate-45 shadow-xl" style={{animation: 'geometricPulse 12s ease-in-out infinite', animationDelay: '4s'}} />
          
          {/* Additional bold floating elements */}
          <div className="absolute top-1/4 left-1/2 w-10 h-10 border-2 border-orange-400/60 rounded-full transform -translate-x-1/2 shadow-lg" />
          <div className="absolute bottom-1/4 right-1/3 w-6 h-20 bg-gradient-to-b from-transparent via-purple-300/50 to-transparent shadow-lg" />
          <div className="absolute top-3/4 left-1/4 w-20 h-6 bg-gradient-to-r from-transparent via-teal-300/50 to-transparent shadow-lg" />
          
          {/* Extra geometric elements for clarity */}
          <div className="absolute top-1/6 right-1/6 w-8 h-8 bg-gradient-to-br from-purple-300/40 to-pink-300/40 rotate-12" />
          <div className="absolute bottom-1/6 left-1/6 w-6 h-6 border-2 border-teal-400/50 rotate-45" />
        </div>
        
        {/* Clean white base */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/80 to-white/85" />
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
          <div className="bg-orange-500/15 border-2 border-orange-500 rounded-[25px] p-4 mb-4">
            <h3 className="text-orange-700 font-bold">OPTION C: Geometric Minimalism</h3>
            <p className="text-sm text-orange-600">Geometric shapes | Animated patterns | Bold lines & shadows</p>
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