'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            style={{
              top: `${10 + i * 8}%`,
              left: `${5 + i * 8}%`,
              animation: `particleFloat ${15 + i * 3}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-[10px] rounded-full p-2 mr-4">
                <Image
                  src="/images/logo.png"
                  alt="Im Your SiS Logo"
                  width={60}
                  height={60}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="text-2xl font-libre font-bold">Im Your SiS</h3>
                <p className="text-gray-300 text-sm">Holistische Baarmoederpraktijk</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Heilige diensten ter ondersteuning van jouw reis terug naar heelheid, 
              ontworpen met liefde en eeuwenoude wijsheid. Waar jouw baarmoeder gehoord wordt.
            </p>

            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-white/10 backdrop-blur-[10px] rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <span className="text-sm">📧</span>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-white/10 backdrop-blur-[10px] rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <span className="text-sm">📱</span>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-white/10 backdrop-blur-[10px] rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <span className="text-sm">🌐</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-libre font-bold mb-6 text-white">Behandelingen</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Diving Deep Womb Treatment
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Restoring Energy Massage
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Fertility Cyclus Massage
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Geboortetrauma
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Breathwork
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Workshops
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-libre font-bold mb-6 text-white">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-gray-400 mt-1">📍</span>
                <div>
                  <p className="text-gray-300 text-sm">Praktijk Locatie</p>
                  <p className="text-gray-400 text-xs">Neem contact op voor adres</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-gray-400 mt-1">📧</span>
                <div>
                  <p className="text-gray-300 text-sm">E-mail</p>
                  <p className="text-gray-400 text-xs">Via contactformulier</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-gray-400 mt-1">⏰</span>
                <div>
                  <p className="text-gray-300 text-sm">Openingstijden</p>
                  <p className="text-gray-400 text-xs">Op afspraak</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-white/10 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left">
              <p>&copy; 2024 Im Your SiS - Samora Indira Schurman. Alle rechten voorbehouden.</p>
            </div>
            
            <div className="flex space-x-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Voorwaarden
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Cookies
              </a>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              Website ontwikkeld met liefde voor holistische genezing
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}