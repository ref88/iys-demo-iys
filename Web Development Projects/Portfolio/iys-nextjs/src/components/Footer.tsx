'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Subtle background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pink-200/30 rounded-full"
            style={{
              top: `${15 + i * 8}%`,
              left: `${5 + i * 8}%`,
              animation: `particleFloat ${8 + i * 2}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/60 backdrop-blur-[15px] border-t border-b border-white/50 p-8 md:p-16 shadow-[0_15px_35px_rgba(0,0,0,0.08)]"
        >
          <div className="max-w-7xl mx-auto">
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
                <div className="relative w-16 h-16 mr-4">
                  <div className="absolute w-16 h-16 bg-gray-100 border border-gray-200 rounded-full shadow-sm"></div>
                  <Image
                    src="/images/logo.png"
                    alt="Im Your SiS Logo"
                    width={64}
                    height={64}
                    style={{ objectFit: 'cover', transform: 'scale(1.164)' }}
                    className="rounded-full relative z-20"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-libre font-bold" style={{color: '#674870'}}>Im Your SiS</h3>
                  <p className="text-lg font-dancing italic text-gray-600">Holistische Baarmoederpraktijk</p>
                </div>
              </div>
              
              <div className="w-12 h-[1px] bg-gradient-to-r from-pink-300 to-transparent mb-6" />

              <div className="flex space-x-4">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-300"
                >
                  <span className="text-sm">📧</span>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-300"
                >
                  <span className="text-sm">📱</span>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-300"
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
              <h4 className="text-lg font-libre font-bold mb-6" style={{color: '#674870'}}>Behandelingen</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm">
                    Diving Deep Womb Treatment
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm">
                    Restoring Energy Massage
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm">
                    Fertility Cyclus Massage
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm">
                    Geboortetrauma
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm">
                    Breathwork
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm">
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
              <h4 className="text-lg font-libre font-bold mb-6" style={{color: '#674870'}}>Contact</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-gray-500 mt-1">⏰</span>
                  <div>
                    <p className="text-gray-700 text-sm">Openingstijden</p>
                    <p className="text-gray-500 text-xs">Ma 12:00 - 20:00</p>
                    <p className="text-gray-500 text-xs">Di 11:00 - 17:30</p>
                    <p className="text-gray-500 text-xs">Do 11:00 - 17:30</p>
                    <p className="text-gray-500 text-xs">Vr 11:00 - 17:30</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-gray-500 mt-1">🏢</span>
                  <div>
                    <p className="text-gray-700 text-sm">KvK nummer</p>
                    <p className="text-gray-500 text-xs">72445114</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-gray-500 mt-1">🏦</span>
                  <div>
                    <p className="text-gray-700 text-sm">BTW nummer</p>
                    <p className="text-gray-500 text-xs">NL001125828B47</p>
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
            className="border-t border-gray-200 mt-12 pt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-500 text-sm text-center md:text-left">
                <p>&copy; &apos;Im Your SiS&apos; 2018. Alle rechten voorbehouden.</p>
              </div>
              
              <div className="flex space-x-6 text-gray-500 text-sm">
                <a href="#" className="hover:text-gray-700 transition-colors duration-200">
                  Privacyverklaring
                </a>
                <a href="#" className="hover:text-gray-700 transition-colors duration-200">
                  Algemene Voorwaarden
                </a>
                <a href="#" className="hover:text-gray-700 transition-colors duration-200">
                  Klachtenreglement
                </a>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-xs">
                Webdesign by Falderty
              </p>
            </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}