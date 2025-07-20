'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function WelcomeSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -125]);
  
  return (
    <section ref={containerRef} className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Subtle background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pink-200/30 rounded-full"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 12}%`,
              animation: `particleFloat ${8 + i * 2}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/60 backdrop-blur-[15px] border border-white/50 rounded-[30px] p-8 md:p-12 shadow-[0_15px_35px_rgba(0,0,0,0.08)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Column */}
            <div className="lg:order-2">
              <motion.figure
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.4 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="relative overflow-hidden rounded-[25px] h-[600px] shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                  <motion.div style={{ y }}>
                    <Image
                      src="/images/sis_yoni_egg.jpeg"
                      alt="Sacred yoni egg for feminine healing and empowerment"
                      width={500}
                      height={700}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </motion.div>
                  
                  {/* Luxury glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-100/20 via-purple-100/20 to-pink-100/20 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
                </div>
                
                <figcaption className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-[10px] rounded-[15px] px-4 py-2 text-white text-sm border border-white/20">
                  Sacred feminine healing tool
                </figcaption>
              </motion.figure>
            </div>

            {/* Content Column */}
            <div className="lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <motion.h2 
                  className="text-3xl sm:text-4xl md:text-5xl font-libre font-bold mb-6"
                  style={{color: '#674870'}}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Dear SiS
                </motion.h2>

                <motion.div 
                  className="text-xl font-dancing italic text-gray-600 mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Where your womb finds its voice
                </motion.div>

                <div className="w-12 h-[1px] bg-gradient-to-r from-pink-300 to-transparent mb-6" />

                <motion.div 
                  className="space-y-4 text-base leading-6 sm:leading-relaxed text-gray-700"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <p>
                    Mijn missie begint bij de baarmoeder. Als baarmoedertherapeut is het mijn doel om je te ondersteunen bij het ontdekken van je innerlijke kracht.
                  </p>
                  
                  <p>
                    Met de grootste liefde en zorg ben ik hier om je te begeleiden op jouw reis naar heling van binnenuit. Of het nu via een een-op-een sessie, workshop of retreat is, ik help je vinden wat het beste bij jou past.
                  </p>
                  
                  <div className="py-4">
                    <p className="text-gray-600 italic">
                      You are not alone in this.
                    </p>
                    <p className="font-medium text-gray-800 mt-1">
                      After all, I am your sis.
                    </p>
                  </div>
                  
                  <p>
                    Bekijk het aanbod en laat weten wat ik voor je kan betekenen.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="pt-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      className="btn-fill text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                      onClick={() => {
                        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Bekijk aanbod
                    </button>
                    <button 
                      className="bg-white/70 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-all duration-300"
                      onClick={() => {
                        window.open('mailto:info@imyoursis.nl?subject=Afspraak aanvragen&body=Hallo Samora,%0A%0AIk zou graag een afspraak willen maken.%0A%0AWaar kan ik je mee helpen:%0A%0AMijn voorkeur voor datum/tijd:%0A%0AMet vriendelijke groet,', '_blank');
                      }}
                    >
                      Plan afspraak
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-gray-600">Love,</p>
                    <cite className="text-base sm:text-lg font-libre font-medium" style={{color: '#674870'}}>
                      Samora Indira Schurman
                    </cite>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}