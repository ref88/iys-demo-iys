'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  privacy: boolean;
}

const serviceOptions = [
  'Diving Deep Womb Treatment',
  'Fertility Cyclus Massage',
  'Restoring Energy Massage',
  'Geboortetrauma',
  'Breathwork',
  'Workshops',
  'Algemene vraag',
  'Tarieven informatie'
];

export default function ContactSection() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacy: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Simulate form submission with potential error
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random success/error for demo
          if (Math.random() > 0.8) {
            reject(new Error('Er is een fout opgetreden bij het verzenden. Probeer het later opnieuw.'));
          } else {
            resolve(true);
          }
        }, 2000);
      });
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        privacy: false
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setIsSubmitting(false);
      setSubmitError(error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden.');
      
      // Reset error message after 8 seconds
      setTimeout(() => setSubmitError(null), 8000);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Subtle background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pink-200/30 rounded-full"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 12}%`,
              animation: `particleFloat ${8 + i * 2}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-libre font-bold mb-6" style={{color: '#674870'}}>
            Vragen?
          </h2>
          <p className="text-xl font-dancing italic text-gray-600 mb-4">
            Laat je gegevens achter en ik neem zo snel mogelijk contact met je op
          </p>
          <div className="w-12 h-[1px] bg-gradient-to-r from-pink-300 to-transparent mx-auto" />
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
          <div className="bg-white/60 backdrop-blur-[15px] border border-white/50 rounded-[30px] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.08)]">
            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-libre font-bold mb-2" style={{color: '#674870'}}>
                  Bericht verzonden!
                </h3>
                <p className="text-gray-600">
                  Bedankt voor je bericht. Ik neem zo snel mogelijk contact met je op.
                </p>
              </motion.div>
            ) : submitError ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">✕</span>
                </div>
                <h3 className="text-xl font-libre font-bold mb-2 text-red-600">
                  Fout bij verzenden
                </h3>
                <p className="text-gray-600 mb-4">
                  {submitError}
                </p>
                <button
                  onClick={() => setSubmitError(null)}
                  className="btn-fill text-white px-6 py-2 rounded-xl font-medium"
                >
                  Probeer opnieuw
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-300 placeholder-gray-500 text-base"
                    placeholder="Naam"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-300 placeholder-gray-500 text-base"
                    placeholder="E-mailadres"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-300 placeholder-gray-500 text-base"
                    placeholder="Telefoonnummer (optioneel)"
                  />
                </div>

                {/* Subject Dropdown */}
                <div className="relative">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-300 text-gray-700 appearance-none cursor-pointer text-base"
                  >
                    <option value="">Ik heb een vraag over...</option>
                    {serviceOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-300 placeholder-gray-500 resize-none"
                    placeholder="Jouw vraag of opmerking..."
                  />
                </div>

                {/* Privacy Checkbox */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="privacy"
                    id="privacy"
                    checked={formData.privacy}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-600 leading-relaxed">
                    Ik ga akkoord met de{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700 underline">
                      privacyverklaring
                    </a>{' '}
                    en geef toestemming voor het verwerken van mijn gegevens voor het beantwoorden van mijn vraag.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.privacy}
                  className="w-full btn-fill text-white py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Verzenden...' : 'Verzend'}
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Image & Map Column */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Cards Photo */}
          <div className="relative group">
            <div className="bg-white/60 backdrop-blur-[15px] border border-white/50 rounded-[30px] p-4 shadow-[0_15px_35px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="relative overflow-hidden rounded-[25px]">
                <Image
                  src="/images/sis_cards_shuffle2.jpg"
                  alt="Sacred oracle cards for guidance and healing"
                  width={400}
                  height={300}
                  className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Quote overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-dancing text-xl italic text-center drop-shadow-lg">
                    &quot;In elke kaart ligt een boodschap van wijsheid&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="bg-white/60 backdrop-blur-[15px] border border-white/50 rounded-[30px] p-4 shadow-[0_15px_35px_rgba(0,0,0,0.08)]">
            <div className="relative overflow-hidden rounded-[25px] h-60">
              {/* Placeholder for Google Maps */}
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Im Your SiS</p>
                  <p className="text-sm text-gray-500">Healing Practice</p>
                </div>
                
                {/* Address overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-[10px] rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800">Locatie & Routebeschrijving</p>
                  <button className="mt-1 text-xs btn-fill text-white px-3 py-1 rounded-full">
                    Bekijk kaart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </section>
  );
}