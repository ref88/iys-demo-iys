'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

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

export default function HeaderZen() {
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [wombHealingSubmenuOpen, setWombHealingSubmenuOpen] = useState(false);
  const [energeticHealingSubmenuOpen, setEnergeticHealingSubmenuOpen] = useState(false);
  const [breathworkSubmenuOpen, setBreathworkSubmenuOpen] = useState(false);
  const [closeTimeoutId, setCloseTimeoutId] = useState<NodeJS.Timeout | null>(null);
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-8 py-6 lg:px-16 lg:py-8">
        
        {/* Left Navigation */}
        <motion.nav
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex space-x-8"
        >
          <div 
            className="relative"
            onMouseEnter={() => {
              if (closeTimeoutId) {
                clearTimeout(closeTimeoutId);
                setCloseTimeoutId(null);
              }
              setServicesDropdownOpen(true);
            }}
            onMouseLeave={() => {
              const timeoutId = setTimeout(() => {
                setServicesDropdownOpen(false);
                setWombHealingSubmenuOpen(false);
                setEnergeticHealingSubmenuOpen(false);
                setBreathworkSubmenuOpen(false);
              }, 300);
              setCloseTimeoutId(timeoutId);
            }}
          >
            <a href="#services" className="text-gray-700 hover:text-gray-900 font-libre font-light text-sm tracking-wide transition-colors duration-300">
              Services
            </a>
            
            {/* Services Dropdown */}
            {servicesDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-[20px] border border-gray-200 rounded-lg overflow-hidden shadow-lg"
                onMouseEnter={() => {
                  if (closeTimeoutId) {
                    clearTimeout(closeTimeoutId);
                    setCloseTimeoutId(null);
                  }
                  setServicesDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  const timeoutId = setTimeout(() => {
                    setServicesDropdownOpen(false);
                    setWombHealingSubmenuOpen(false);
                    setEnergeticHealingSubmenuOpen(false);
                    setBreathworkSubmenuOpen(false);
                  }, 300);
                  setCloseTimeoutId(timeoutId);
                }}
              >
                {services.map((service) => (
                  <div 
                    key={service.name}
                    className="relative"
                    onMouseEnter={() => {
                      if (closeTimeoutId) {
                        clearTimeout(closeTimeoutId);
                        setCloseTimeoutId(null);
                      }
                      
                      // Set the correct submenu state immediately
                      setWombHealingSubmenuOpen(service.name === 'Womb Healing & Care');
                      setEnergeticHealingSubmenuOpen(service.name === 'Energetic Healing');
                      setBreathworkSubmenuOpen(service.name === 'Breathwork');
                    }}
                    onMouseLeave={() => {
                      // Don't close immediately, let the parent timeout handle it
                    }}
                  >
                    <a
                      href={service.href}
                      className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-libre font-light text-sm transition-colors duration-300"
                    >
                      {service.name}
                      {service.hasSubmenu && <span className="float-right">›</span>}
                    </a>
                    
                    {/* Submenu */}
                    {service.hasSubmenu && (
                      <>
                        {service.name === 'Womb Healing & Care' && wombHealingSubmenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-0 left-full ml-1 w-64 bg-white/95 backdrop-blur-[20px] border border-gray-200 rounded-lg overflow-hidden shadow-lg z-50"
                            onMouseEnter={() => {
                              if (closeTimeoutId) {
                                clearTimeout(closeTimeoutId);
                                setCloseTimeoutId(null);
                              }
                              setWombHealingSubmenuOpen(true);
                            }}
                            onMouseLeave={() => {
                              // Don't close immediately, let the parent timeout handle it
                            }}
                          >
                            {service.submenu?.map((subservice) => (
                              <a
                                key={subservice.name}
                                href={subservice.href}
                                className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-libre font-light text-sm transition-colors duration-300"
                              >
                                {subservice.name}
                              </a>
                            ))}
                          </motion.div>
                        )}
                        
                        {service.name === 'Energetic Healing' && energeticHealingSubmenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-0 left-full ml-1 w-64 bg-white/95 backdrop-blur-[20px] border border-gray-200 rounded-lg overflow-hidden shadow-lg z-50"
                            onMouseEnter={() => {
                              if (closeTimeoutId) {
                                clearTimeout(closeTimeoutId);
                                setCloseTimeoutId(null);
                              }
                              setEnergeticHealingSubmenuOpen(true);
                            }}
                            onMouseLeave={() => {
                              // Don't close immediately, let the parent timeout handle it
                            }}
                          >
                            {service.submenu?.map((subservice) => (
                              <a
                                key={subservice.name}
                                href={subservice.href}
                                className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-libre font-light text-sm transition-colors duration-300"
                              >
                                {subservice.name}
                              </a>
                            ))}
                          </motion.div>
                        )}
                        
                        {service.name === 'Breathwork' && breathworkSubmenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-0 left-full ml-1 w-64 bg-white/95 backdrop-blur-[20px] border border-gray-200 rounded-lg overflow-hidden shadow-lg z-50"
                            onMouseEnter={() => {
                              if (closeTimeoutId) {
                                clearTimeout(closeTimeoutId);
                                setCloseTimeoutId(null);
                              }
                              setBreathworkSubmenuOpen(true);
                            }}
                            onMouseLeave={() => {
                              // Don't close immediately, let the parent timeout handle it
                            }}
                          >
                            {service.submenu?.map((subservice) => (
                              <a
                                key={subservice.name}
                                href={subservice.href}
                                className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-libre font-light text-sm transition-colors duration-300"
                              >
                                {subservice.name}
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
          <a href="#about" className="text-gray-700 hover:text-gray-900 font-libre font-light text-sm tracking-wide transition-colors duration-300">
            About
          </a>
        </motion.nav>


        {/* Right Navigation */}
        <motion.nav
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex space-x-8"
        >
          <a href="#reviews" className="text-gray-700 hover:text-gray-900 font-libre font-light text-sm tracking-wide transition-colors duration-300">
            Reviews
          </a>
          <a href="#contact" className="text-gray-700 hover:text-gray-900 font-libre font-light text-sm tracking-wide transition-colors duration-300">
            Contact
          </a>
        </motion.nav>
      </div>
      
      {/* Subtle bottom border */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 1.2 }}
        className="h-[1px] bg-gray-200 mx-8 lg:mx-16"
        style={{ transformOrigin: 'left' }}
      />
    </header>
  );
}