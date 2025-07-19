'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface QuoteProps {
  section: 'welcome' | 'services' | 'about' | 'contact';
}

const quotePools = {
  welcome: [
    "Your womb is your center of creation and power",
    "Healing begins when you honor your sacred feminine",
    "In stillness, your womb remembers its wisdom",
    "Trust the ancient knowing that lives within you"
  ],
  services: [
    "Every woman deserves to feel whole in her body",
    "Healing is not about fixing, it's about remembering",
    "Your body holds ancient wisdom waiting to be awakened",
    "Sacred touch awakens the healer within"
  ],
  about: [
    "Sisterhood is the healing balm the world needs",
    "When women support women, magic happens",
    "You are held by the love of all women before you",
    "In sacred circle, we remember who we are"
  ],
  contact: [
    "Your healing journey begins with a single step",
    "The courage to reach out is the courage to heal",
    "You don't have to walk this path alone",
    "Your story matters, your healing matters"
  ]
};

// Get daily quote based on date and section
const getDailyQuote = (section: keyof typeof quotePools): string => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const quotes = quotePools[section];
  const index = (dayOfYear + section.length) % quotes.length;
  return quotes[index];
};

export default function ContextualQuote({ section }: QuoteProps) {
  const [quote, setQuote] = useState<string>('');

  useEffect(() => {
    setQuote(getDailyQuote(section));
  }, [section]);

  if (!quote) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          viewport={{ once: true, amount: 0.6 }}
          className="text-center"
        >
          <blockquote className="text-3xl md:text-5xl font-libre font-normal text-transparent bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text leading-tight">
            "{quote}"
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}