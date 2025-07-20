'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function RefinedDemo4() {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Option D: Micro-Texture */}
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src="/images/sis_meditation.jpg"
            alt="Healing background"
            fill
            className="object-cover opacity-[0.15]"
            style={{ 
              objectPosition: 'center',
              filter: 'blur(1px) saturate(0.7)'
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/70 to-white/75" />
        
        {/* Additional subtle texture overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/20 to-white/40" 
             style={{ background: 'radial-gradient(circle at 30% 70%, transparent 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)' }} />
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
          <div className="bg-green-500/15 border-2 border-green-500 rounded-[25px] p-4 mb-4">
            <h3 className="text-green-700 font-bold">OPTION D: Micro-Texture</h3>
            <p className="text-sm text-green-600">Opacity: 0.15 | Blur effect | Subtle dreamlike quality</p>
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