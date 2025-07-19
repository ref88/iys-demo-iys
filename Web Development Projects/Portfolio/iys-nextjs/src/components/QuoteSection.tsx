'use client';

import { motion } from 'framer-motion';

export default function QuoteSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.6 }}
          className="text-center"
        >
          <blockquote className="text-4xl md:text-6xl font-libre font-normal text-transparent bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text leading-tight">
            "You are, because she is"
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}