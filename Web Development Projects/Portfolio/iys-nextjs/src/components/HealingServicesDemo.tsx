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
  const [currentVersion, setCurrentVersion] = useState<VersionType>('eventFocus');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Version Selector */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Healing Services - Version Tester</h1>
          <div className="flex flex-wrap gap-4">
            {(Object.keys(versionInfo) as VersionType[]).map((version) => (
              <motion.button
                key={version}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentVersion(version)}
                className={`
                  px-6 py-3 rounded-xl font-medium text-white transition-all duration-300
                  ${currentVersion === version 
                    ? `bg-gradient-to-r ${versionInfo[version].color} shadow-lg` 
                    : 'bg-gray-400 hover:bg-gray-500'
                  }
                `}
              >
                <div className="text-left">
                  <div className="font-semibold">{versionInfo[version].name}</div>
                  <div className="text-sm opacity-90">{versionInfo[version].description}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Version Display */}
      <motion.div
        key={currentVersion}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HealingServicesSection version={currentVersion} />
      </motion.div>
    </div>
  );
}