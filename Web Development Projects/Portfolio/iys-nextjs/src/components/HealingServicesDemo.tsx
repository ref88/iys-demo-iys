'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import HealingServicesSection from './HealingServicesSection';

type VersionType = 'eventFocus' | 'experiences' | 'sacred';

const versionInfo = {
  eventFocus: {
    name: 'Version 1: Event Focus',
    description: '5 tabs met focus op aankomende events',
    color: 'from-blue-500 to-purple-600'
  },
  experiences: {
    name: 'Version 2: Experience Categories', 
    description: '4 tabs met community experiences',
    color: 'from-green-500 to-teal-600'
  },
  sacred: {
    name: 'Version 3: Sacred Journey',
    description: '5 tabs met spirituele benamingen',
    color: 'from-purple-500 to-pink-600'
  }
};

export default function HealingServicesDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Healing Services - All Versions</h1>
          <p className="text-gray-600">Vergelijk alle 3 tab-versies direct onder elkaar</p>
        </div>
      </div>

      {/* All Versions Display */}
      <div className="space-y-16 pb-16">
        {(Object.keys(versionInfo) as VersionType[]).map((version, index) => (
          <div key={version} className="relative">
            {/* Version Header */}
            <div className="max-w-6xl mx-auto px-6 py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`
                  inline-flex items-center gap-4 px-8 py-4 rounded-2xl text-white font-bold text-xl
                  bg-gradient-to-r ${versionInfo[version].color} shadow-xl mb-8
                `}
              >
                <span className="text-3xl">
                  {version === 'eventFocus' && '📅'}
                  {version === 'experiences' && '🌟'}  
                  {version === 'sacred' && '🕊️'}
                </span>
                <div>
                  <div className="font-libre text-xl">{versionInfo[version].name}</div>
                  <div className="text-sm opacity-90 font-normal">{versionInfo[version].description}</div>
                </div>
              </motion.div>
            </div>

            {/* Version Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <HealingServicesSection version={version} />
            </motion.div>

            {/* Divider (except for last version) */}
            {index < Object.keys(versionInfo).length - 1 && (
              <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="border-t border-gray-300 opacity-30"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}