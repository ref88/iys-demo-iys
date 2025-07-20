'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const wombHealingServices = [
  { name: 'Diving Deep Womb Treatment', href: '#services' },
  { name: 'Fertility Cyclus Massage', href: '#services' },
  { name: 'Treasure Steam', href: '#services' },
];

const energeticHealingServices = [
  { name: 'Restoring Energy Massage', href: '#services' },
  { name: 'Geboortetrauma', href: '#services' },
];

const breathworkServices = [
  { name: 'Breathe in, Breathe out', href: '#services' },
];

const services = [
  { name: 'Womb Healing & Care', href: '#services', hasSubmenu: true, submenu: wombHealingServices },
  { name: 'Energetic Healing', href: '#services', hasSubmenu: true, submenu: energeticHealingServices },
  { name: 'Breathwork', href: '#services', hasSubmenu: true, submenu: breathworkServices },
  { name: 'Retreats', href: '#services' },
  { name: 'Workshops', href: '#services' },
];

const navigation = [
  { name: 'Services', href: '#services', hasDropdown: true },
  { name: 'About', href: '#about' },
  { name: 'Reviews', href: '#reviews' },
  { name: 'Contact', href: '#contact' },
];

const scrollToSection = (href: string) => {
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

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
        className="fixed top-0 left-0 right-0 z-[1000] bg-transparent"
      >
        <div className="flex items-center justify-between px-8 py-6 lg:px-16 lg:py-8">
          
          {/* Left Logo - Ultra Minimal */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Link href="/" className="text-white font-libre font-extralight text-lg tracking-wide">
              IM YOUR SIS
            </Link>
          </motion.div>

          {/* Right Navigation - Clean */}
          <motion.nav
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="hidden md:flex items-center space-x-10"
          >
            {navigation.map((item) => (
              <div 
                key={item.name} 
                className="relative"
                onMouseEnter={() => {
                  if (item.hasDropdown) {
                    setServicesDropdownOpen(true);
                    setActiveSubmenu(null);
                  }
                }}
                onMouseLeave={() => {
                  if (item.hasDropdown) {
                    setTimeout(() => {
                      setServicesDropdownOpen(false);
                      setActiveSubmenu(null);
                    }, 300);
                  }
                }}
              >
                <button
                  onClick={() => scrollToSection(item.href)}
                  className="text-white/80 hover:text-white font-libre font-light text-sm tracking-wide transition-colors duration-300"
                >
                  {item.name}
                </button>
                
                {/* Services Dropdown */}
                {item.hasDropdown && servicesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-black/90 backdrop-blur-[20px] border border-white/10 rounded-lg overflow-hidden"
                    onMouseEnter={() => {
                      setServicesDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      setTimeout(() => {
                        setServicesDropdownOpen(false);
                        setActiveSubmenu(null);
                      }, 300);
                    }}
                  >
                    {services.map((service) => (
                      <div 
                        key={service.name}
                        className="relative"
                        onMouseEnter={() => {
                          if (service.hasSubmenu) {
                            setActiveSubmenu(service.name);
                          }
                        }}
                        onMouseLeave={() => {
                          // Don't close immediately
                        }}
                      >
                        <button
                          onClick={() => scrollToSection(service.href)}
                          className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 font-libre font-light text-sm transition-colors duration-300"
                        >
                          {service.name}
                          {service.hasSubmenu && <span className="float-right">›</span>}
                        </button>
                        
                        {/* Submenu */}
                        {service.hasSubmenu && activeSubmenu === service.name && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-0 left-full ml-1 w-64 bg-black/90 backdrop-blur-[20px] border border-white/10 rounded-lg overflow-hidden z-50"
                            onMouseEnter={() => {
                              setActiveSubmenu(service.name);
                            }}
                            onMouseLeave={() => {
                              // Don't close immediately
                            }}
                          >
                            {service.submenu?.map((subservice) => (
                              <button
                                key={subservice.name}
                                onClick={() => scrollToSection(subservice.href)}
                                className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 font-libre font-light text-sm transition-colors duration-300"
                              >
                                {subservice.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
            
            {/* Appointment Button */}
            <button
              onClick={() => {
                window.open('mailto:info@imyoursis.nl?subject=Afspraak aanvragen&body=Hallo Samora,%0A%0AIk zou graag een afspraak willen maken.%0A%0AWaar kan ik je mee helpen:%0A%0AMijn voorkeur voor datum/tijd:%0A%0AMet vriendelijke groet,', '_blank');
              }}
              className="border border-white/40 text-white hover:bg-white hover:text-gray-900 px-4 py-2 font-libre font-light text-sm tracking-wide transition-all duration-300 rounded"
            >
              Maak Afspraak
            </button>
          </motion.nav>

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
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-[20px] border-b border-white/10 md:hidden"
          >
            <div className="px-6 py-4 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    scrollToSection(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-white/80 hover:text-white font-libre font-light text-sm px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
                >
                  {item.name}
                </button>
              ))}
              
              {/* Mobile Appointment Button */}
              <button
                onClick={() => {
                  window.open('mailto:info@imyoursis.nl?subject=Afspraak aanvragen&body=Hallo Samora,%0A%0AIk zou graag een afspraak willen maken.%0A%0AWaar kan ik je mee helpen:%0A%0AMijn voorkeur voor datum/tijd:%0A%0AMet vriendelijke groet,', '_blank');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left border border-white/40 text-white hover:bg-white hover:text-gray-900 font-libre font-light text-sm px-3 py-2 rounded-lg transition-all duration-300 mt-4"
              >
                Maak Afspraak
              </button>
            </div>
          </motion.div>
        )}
      </motion.header>
    </>
  );
}