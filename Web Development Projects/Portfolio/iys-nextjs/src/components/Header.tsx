'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Aanbod', href: '/services' },
  { name: 'Womb-versie', href: '/womb-versie' },
  { name: 'Tarieven', href: '/tarieven' },
  { name: 'Over mij', href: '/over-mij' },
  { name: 'FAQ', href: '/faq' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-[100px] bg-white/10 backdrop-blur-[20px] border-b border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-[1000] px-12 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <div className="relative w-[60px] h-[60px] bg-white/15 backdrop-blur-[15px] rounded-full border border-white/30 flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="Im Your SiS Logo"
            width={36}
            height={36}
            style={{ width: 'auto', height: 'auto' }}
            className="object-contain"
          />
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-1 items-center justify-center">
        <div className="flex items-center space-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-white/90 hover:text-white font-medium text-base px-5 py-3 rounded-lg transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5 font-libre"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Booking Button */}
      <div className="hidden md:block flex-shrink-0">
        <motion.a
          href="#booking"
          whileHover={{ 
            scale: 1.05, 
            y: -2,
            boxShadow: '0 10px 30px rgba(168, 181, 160, 0.3)'
          }}
          whileTap={{ scale: 1.02 }}
          className="bg-iys-green/20 border-2 border-iys-green/40 text-white px-8 py-4 rounded-[12px] font-semibold text-sm uppercase tracking-wider font-libre transition-all duration-300 hover:bg-iys-green/30 hover:border-iys-green/60"
        >
          Boek Jouw Afspraak
        </motion.a>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          type="button"
          className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-[100px] left-0 right-0 bg-white/10 backdrop-blur-[20px] border-b border-white/20 md:hidden"
        >
          <div className="px-6 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-white/90 hover:text-white font-medium text-base px-3 py-2 rounded-lg transition-colors hover:bg-white/10 font-libre"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2">
              <a
                href="#booking"
                className="block text-center bg-iys-green/20 border border-iys-green/40 text-white px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider font-libre transition-colors hover:bg-iys-green/30"
                onClick={() => setMobileMenuOpen(false)}
              >
                Boek Jouw Afspraak
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}