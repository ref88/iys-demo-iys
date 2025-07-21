'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function FooterZen() {
  return (
    <footer className="py-20 bg-white border-t border-stone-200/60">
      <div className="max-w-6xl mx-auto px-8">
        {/* Zen line at top */}
        <div className="flex justify-center mb-16">
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 80, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1.5, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="h-[1px] bg-stone-300"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-12"
        >
          {/* Logo & Brand */}
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12">
                <Image
                  src="/images/logo.png"
                  alt="Im Your SiS Logo"
                  width={48}
                  height={48}
                  style={{ objectFit: 'cover' }}
                  className="rounded-full"
                />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-light text-stone-800 tracking-wide">Im Your SiS</h3>
                <p className="text-sm text-stone-600 font-light italic">Sacred Healing Practice</p>
              </div>
            </div>
            
            <p className="text-stone-600 font-light leading-relaxed max-w-md">
              Ondersteunend, helend en versterkend voor vrouwen op hun reis naar heelheid en eigenwaarde.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="space-y-3">
              <h4 className="text-stone-800 font-light tracking-wide text-sm uppercase">Services</h4>
              <div className="space-y-2">
                <a href="#services" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Sacred Womb</a>
                <a href="#services" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Energy Flow</a>
                <a href="#services" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Sacred Breath</a>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-stone-800 font-light tracking-wide text-sm uppercase">Experiences</h4>
              <div className="space-y-2">
                <a href="#services" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Sacred Escapes</a>
                <a href="#services" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Sister Circles</a>
                <a href="#reviews" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Reviews</a>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-stone-800 font-light tracking-wide text-sm uppercase">Over</h4>
              <div className="space-y-2">
                <a href="#about" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Dear Sis</a>
                <a href="#contact" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Contact</a>
                <a href="/privacy" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Privacy</a>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-stone-800 font-light tracking-wide text-sm uppercase">Connect</h4>
              <div className="space-y-2">
                <a href="mailto:info@imyoursis.nl" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Email</a>
                <a href="tel:+31612345678" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Telefoon</a>
                <a href="https://instagram.com/imyoursis" target="_blank" rel="noopener noreferrer" className="block text-stone-600 hover:text-stone-800 transition-colors font-light text-sm">Instagram</a>
              </div>
            </div>
          </div>

          {/* Zen line separator */}
          <div className="flex justify-center">
            <div className="w-12 h-[1px] bg-stone-300" />
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-stone-600 font-light">
              <a 
                href="mailto:info@imyoursis.nl" 
                className="hover:text-stone-800 transition-colors border-b border-transparent hover:border-stone-300"
              >
                info@imyoursis.nl
              </a>
              <span className="hidden md:inline text-stone-400">|</span>
              <a 
                href="tel:+31612345678" 
                className="hover:text-stone-800 transition-colors border-b border-transparent hover:border-stone-300"
              >
                06 123 456 78
              </a>
              <span className="hidden md:inline text-stone-400">|</span>
              <span>Amsterdam, Nederland</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-stone-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500 font-light">
              <p>&copy; 2024 Im Your SiS. Alle rechten voorbehouden.</p>
              <div className="flex gap-4">
                <a href="/privacy" className="hover:text-stone-700 transition-colors">Privacy</a>
                <a href="/algemene-voorwaarden" className="hover:text-stone-700 transition-colors">Algemene Voorwaarden</a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}