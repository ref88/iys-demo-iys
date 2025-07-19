'use client';

import { useState, useEffect } from 'react';
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
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setIsVisible(false);
      } else {
        // Scrolling up or at top
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <motion.header 
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          y: isVisible ? 0 : -100 
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 left-0 right-0 h-[100px] bg-white/10 backdrop-blur-[20px] border-b border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-[1000] px-12 flex items-center justify-between"
      >
        {/* Empty space for logo positioning */}
        <div className="flex-shrink-0 w-[60px]"></div>

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

      {/* Final Logo with Option A: Glassmorphism Background - Smaller Size */}
      <motion.div 
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          y: isVisible ? 0 : -100 
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-[50px] left-[50px] z-[1100]"
      >
        <Link href="/" className="block relative">
          <div className="absolute w-[273px] h-[273px] bg-white/32 backdrop-blur-[12px] border border-white/65 rounded-full shadow-[0_6px_25px_rgba(0,0,0,0.12)] top-[16px] left-[26px]"></div>
          <Image
            src="/images/logo.png"
            alt="Im Your SiS Logo"
            width={329}
            height={329}
            style={{ objectFit: 'cover', transform: 'scale(1.164)' }}
            className="rounded-full relative z-20"
          />
        </Link>
      </motion.div>

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
    </motion.header>
    </>
  );
}