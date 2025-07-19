'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCarousel } from '@/contexts/CarouselContext';

export default function WelcomeSection() {
  const { getCurrentGradient } = useCarousel();
  
  return (
    <section className={`py-20 bg-gradient-to-b ${getCurrentGradient()} transition-all duration-[2000ms] ease-in-out`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/15 backdrop-blur-[20px] border border-white/40 rounded-[25px] p-8 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Column */}
            <div className="lg:order-2">
              <motion.figure
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="relative overflow-hidden rounded-[25px] shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                  <Image
                    src="/images/sis_yoni_egg.jpeg"
                    alt="Sacred yoni egg for feminine healing and empowerment"
                    width={500}
                    height={600}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Luxury glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/30 via-orange-400/20 to-yellow-400/30 rounded-[35px] -z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
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
                  className="text-4xl md:text-5xl font-libre font-bold text-center text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text"
                  style={{ 
                    textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                    animation: 'shimmer 3s ease-in-out infinite'
                  }}
                >
                  Dear SiS,
                </motion.h2>

                <div className="text-xl font-dancing text-center text-white/90 italic mb-6">
                  &ldquo;Where your womb finds its voice&rdquo;
                </div>

                <div className="space-y-4 text-white/90 leading-relaxed">
                  <p>
                    Mijn missie begint bij de baarmoeder. Als baarmoedertherapeut is het mijn doel om je te ondersteunen bij het ontdekken van je innerlijke kracht.
                  </p>
                  
                  <p>
                    Met de grootste liefde en zorg ben ik hier om je te begeleiden op jouw reis naar heling van binnenuit. Of het nu via een een-op-een sessie, workshop of retreat is, ik help je vinden wat het beste bij jou past.
                  </p>
                  
                  <p>
                    <em>You are not alone in this.</em><br />
                    After all, <strong>I am your sis.</strong>
                  </p>
                  
                  <p>
                    Bekijk het aanbod en laat weten wat ik voor je kan betekenen.
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="pt-6 space-y-2"
                >
                  <p className="text-white/90">Love,</p>
                  <cite className="text-lg font-dancing text-yellow-400">
                    Samora Indira Schurman
                  </cite>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}