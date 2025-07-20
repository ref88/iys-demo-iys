'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCarousel } from '@/contexts/CarouselContext';
import { useRef } from 'react';

export default function WelcomeSectionZen() {
  const { getCurrentGradient } = useCarousel();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -125]);
  
  return (
    <section ref={containerRef} className="py-24 bg-white">
      {/* Zen line */}
      <div className="flex justify-center mb-16">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 80, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1.5, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="h-[1px] bg-gray-400"
        />
      </div>

      <div className="max-w-6xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-16"
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
                <div className="relative overflow-hidden rounded-lg h-[600px]">
                  <motion.div style={{ y }}>
                    <Image
                      src="/images/sis_yoni_egg.jpeg"
                      alt="Sacred yoni egg for feminine healing and empowerment"
                      width={500}
                      height={700}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </motion.div>
                </div>
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
                  className="text-5xl md:text-6xl font-libre font-extralight text-center text-gray-800 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Dear <span className="font-light text-gray-600">SiS</span>
                </motion.h2>

                <motion.div 
                  className="text-sm text-gray-600 font-light tracking-[0.3em] uppercase text-center mb-12"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Where your womb finds its voice
                </motion.div>

                <motion.div 
                  className="max-w-xl mx-auto space-y-6 text-gray-700 leading-relaxed text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <p className="text-lg font-light">
                    Mijn missie begint bij de baarmoeder. Als baarmoedertherapeut is het mijn doel om je te ondersteunen bij het ontdekken van je innerlijke kracht.
                  </p>
                  
                  <p className="text-lg font-light">
                    Met de grootste liefde en zorg ben ik hier om je te begeleiden op jouw reis naar heling van binnenuit. Of het nu via een een-op-een sessie, workshop of retreat is, ik help je vinden wat het beste bij jou past.
                  </p>
                  
                  <div className="py-6">
                    <p className="text-xl font-light text-gray-600 italic">
                      You are not alone in this.
                    </p>
                    <p className="text-xl font-light text-gray-800 mt-2">
                      After all, I am your sis.
                    </p>
                  </div>
                  
                  <p className="text-lg font-light">
                    Bekijk het aanbod en laat weten wat ik voor je kan betekenen.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="pt-8 text-center space-y-2"
                >
                  <p className="text-gray-600 font-light">Love,</p>
                  <cite className="text-xl font-libre font-light text-gray-800">
                    Samora Indira Schurman
                  </cite>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom zen line */}
      <div className="flex justify-center mt-16">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 60, opacity: 1 }}
          transition={{ delay: 1.0, duration: 1.5, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="h-[1px] bg-gray-400"
        />
      </div>
    </section>
  );
}