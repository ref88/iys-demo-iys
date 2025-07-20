'use client';

import { motion } from 'framer-motion';

export default function RefinedDemo5() {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Option E: Pure Clean - No backgrounds, just clean white */}
      <div className="absolute inset-0">
        {/* Ultra-minimal accent lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 w-16 h-[0.5px] bg-gray-200/50 transform -translate-x-1/2" />
          <div className="absolute bottom-1/4 left-1/2 w-12 h-[0.5px] bg-gray-200/50 transform -translate-x-1/2" />
        </div>
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
          <div className="bg-gray-500/15 border-2 border-gray-500 rounded-[25px] p-4 mb-4">
            <h3 className="text-gray-700 font-bold">OPTION E: Pure Clean</h3>
            <p className="text-sm text-gray-600">No backgrounds | Minimal lines | Maximum focus</p>
          </div>
          <div className="bg-white/95 backdrop-blur-[5px] border border-gray-200/60 rounded-[25px] p-8 md:p-12 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
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