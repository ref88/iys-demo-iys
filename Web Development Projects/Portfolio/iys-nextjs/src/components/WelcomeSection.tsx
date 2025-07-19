'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function WelcomeSection() {
  return (
    <section className="py-20 mt-[100px]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-[20px] border border-white/20 rounded-[25px] p-8 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
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
                    src="/images/samora.jpg"
                    alt="Samora, founder of Im Your SIS"
                    width={500}
                    height={600}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Luxury glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/30 via-orange-400/20 to-yellow-400/30 rounded-[35px] -z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                
                <figcaption className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-[10px] rounded-[15px] px-4 py-2 text-white text-sm border border-white/20">
                  Photo: @leonelpiccardo
                  <a 
                    href="https://www.instagram.com/leonelpiccardo/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-yellow-400 hover:text-orange-400 ml-2 transition-colors"
                  >
                    <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                    </svg>
                  </a>
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
                    Mijn toewijding aan jou begint bij de baarmoeder. Als baarmoedertherapeut is het mijn prioriteit om je te ondersteunen bij het ontdekken van je innerlijke kracht.
                  </p>
                  
                  <p>
                    Met de grootste liefde en zorg zal ik je begeleiden op jouw reis naar heling van binnenuit. Of het nu via een een-op-een sessie, workshop of retreat is, ik help je vinden wat het beste bij jou past.
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