'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  privacy: boolean;
}

const serviceOptions = [
  'Sacred Womb Treatment',
  'Treasure Steam',
  'Fertility Cyclus Massage',
  'Energy Flow Massage',
  'Geboortetrauma',
  'Sacred Breath',
  'Sacred Escapes',
  'Sister Circles',
  'Algemene vraag',
  'Tarieven informatie'
];

export default function ContactSectionZen() {
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
      // Create mailto URL with form data
      const subject = `Contactformulier: ${formData.subject}`;
      const body = `Naam: ${formData.name}%0AEmail: ${formData.email}%0ATelefoon: ${formData.phone}%0A%0AOnderwerp: ${formData.subject}%0A%0ABericht:%0A${formData.message}`;
      const mailtoUrl = `mailto:info@imyoursis.nl?subject=${encodeURIComponent(subject)}&body=${body}`;
      
      window.open(mailtoUrl, '_blank');
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          privacy: false
        });
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      setSubmitError('Er is een fout opgetreden. Probeer het opnieuw of neem direct contact op.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          {/* Zen line */}
          <div className="flex justify-center mb-12">
            <div className="w-16 h-[1px] bg-stone-300" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-green-50 border border-green-200 p-8"
          >
            <div className="text-4xl mb-4">🙏</div>
            <h3 className="text-2xl font-light text-stone-800 mb-4">Dankjewel</h3>
            <p className="text-stone-600 font-light leading-relaxed">
              Je email client wordt geopend met jouw bericht. 
              Stuur de email om contact op te nemen.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white">
      {/* Zen line at top */}
      <div className="flex justify-center mb-16">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 120, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1.5, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="h-[1px] bg-stone-300"
        />
      </div>

      <div className="max-w-4xl mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light mb-8 text-stone-800 tracking-wide">
            Neem Contact Op
          </h2>
          <p className="text-xl text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
            Klaar om jouw reis naar healing te beginnen? Laat een bericht achter en we nemen binnen 24 uur contact op.
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Name & Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="name" className="block text-stone-700 font-light mb-3 tracking-wide">
                Naam *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-0 py-3 border-0 border-b border-stone-300 bg-transparent text-stone-800 font-light focus:outline-none focus:border-stone-500 transition-colors duration-300 placeholder-stone-400"
                placeholder="Jouw naam"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-stone-700 font-light mb-3 tracking-wide">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-0 py-3 border-0 border-b border-stone-300 bg-transparent text-stone-800 font-light focus:outline-none focus:border-stone-500 transition-colors duration-300 placeholder-stone-400"
                placeholder="je@email.nl"
              />
            </div>
          </div>

          {/* Phone & Subject Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="phone" className="block text-stone-700 font-light mb-3 tracking-wide">
                Telefoon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-0 py-3 border-0 border-b border-stone-300 bg-transparent text-stone-800 font-light focus:outline-none focus:border-stone-500 transition-colors duration-300 placeholder-stone-400"
                placeholder="06 12345678"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-stone-700 font-light mb-3 tracking-wide">
                Onderwerp *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-0 py-3 border-0 border-b border-stone-300 bg-transparent text-stone-800 font-light focus:outline-none focus:border-stone-500 transition-colors duration-300"
              >
                <option value="">Kies een onderwerp</option>
                {serviceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-stone-700 font-light mb-3 tracking-wide">
              Bericht *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-0 py-3 border-0 border-b border-stone-300 bg-transparent text-stone-800 font-light focus:outline-none focus:border-stone-500 transition-colors duration-300 placeholder-stone-400 resize-none"
              placeholder="Vertel ons waar je mee bezig bent en hoe we je kunnen helpen..."
            />
          </div>

          {/* Privacy Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="privacy"
              name="privacy"
              checked={formData.privacy}
              onChange={handleInputChange}
              required
              className="mt-1 w-4 h-4 text-stone-600 bg-transparent border-stone-300 focus:ring-0 focus:ring-transparent"
            />
            <label htmlFor="privacy" className="text-sm text-stone-600 font-light leading-relaxed">
              Ik ga akkoord met de{' '}
              <a href="/privacy" className="text-stone-800 hover:text-stone-600 transition-colors border-b border-stone-300 hover:border-stone-600">
                privacyverklaring
              </a>{' '}
              en geef toestemming voor het opslaan en verwerken van mijn gegevens voor het beantwoorden van mijn vraag. *
            </label>
          </div>

          {/* Error Message */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 p-4 text-red-700 text-sm font-light"
            >
              {submitError}
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="text-center pt-8">
            {/* Zen line */}
            <div className="flex justify-center mb-8">
              <div className="w-12 h-[1px] bg-stone-300" />
            </div>
            
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`
                px-12 py-4 font-light text-lg tracking-wide transition-all duration-300
                ${isSubmitting 
                  ? 'bg-stone-400 text-white cursor-not-allowed' 
                  : 'bg-stone-800 text-white hover:bg-stone-700'
                }
              `}
            >
              {isSubmitting ? 'Versturen...' : 'Verstuur Bericht'}
            </motion.button>
          </div>
        </motion.form>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          {/* Zen line */}
          <div className="flex justify-center mb-12">
            <div className="w-16 h-[1px] bg-stone-300" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-lg font-light text-stone-800 mb-3 tracking-wide">Email</h4>
              <a 
                href="mailto:info@imyoursis.nl" 
                className="text-stone-600 hover:text-stone-800 transition-colors font-light border-b border-transparent hover:border-stone-300"
              >
                info@imyoursis.nl
              </a>
            </div>
            <div>
              <h4 className="text-lg font-light text-stone-800 mb-3 tracking-wide">Telefoon</h4>
              <a 
                href="tel:+31612345678" 
                className="text-stone-600 hover:text-stone-800 transition-colors font-light border-b border-transparent hover:border-stone-300"
              >
                06 123 456 78
              </a>
            </div>
            <div>
              <h4 className="text-lg font-light text-stone-800 mb-3 tracking-wide">Locatie</h4>
              <p className="text-stone-600 font-light">
                Amsterdam<br />
                Nederland
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}