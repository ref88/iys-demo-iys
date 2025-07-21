'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Service {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  testimonial: string;
  category: string;
}

interface TabCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

type VersionType = 'eventFocus' | 'experiences' | 'sacred';

const services: Service[] = [
  {
    id: 1,
    title: "Diving Deep Womb Treatment",
    subtitle: "Verbinding met je tweede brein",
    description: "De baarmoeder is een van de belangrijkste, maar vaak vergeten deel van het vrouwelijk lichaam en kan gezien worden als een tweede brein. Hoewel we ons bewust zijn van de biologische aspecten van de baarmoeder, wordt vrouwen niet standaard geleerd over de spirituele krachten die het bezit en hoe het van invloed is op ons 'zijn'.",
    duration: "90 minuten",
    testimonial: "\"Het is nu 2 weken geleden en ik voel nog steeds de effecten.\" - S.D.",
    category: "womb"
  },
  {
    id: 2,
    title: "Treasure Steam",
    subtitle: "Heilende stoomceremonie",
    description: "Een zachte en diep genezende stoombehandeling voor de onderbuik en baarmoeder. Treasure Steam is een eeuwenoude praktijk die het vrouwelijk lichaam reinigt, voedt en in balans brengt door middel van medicinale kruiden en warmte.",
    duration: "45 minuten",
    testimonial: "\"Zo'n liefdevolle en helende ervaring. Ik voelde me compleet genesteld.\" - L.K.",
    category: "womb"
  },
  {
    id: 3,
    title: "Fertility Cyclus Massage",
    subtitle: "Voorbereiden op nieuw leven",
    description: "Ben je al een tijdje bezig om zwanger te worden (en/of te blijven) zonder het gewenste resultaat? Of ben je juist bewust bezig met het voorbereiden van je lichaam op een mogelijke zwangerschap? Dan nodig ik je uit om kennis te maken met de bijzondere wereld van vruchtbaarheidsmassage.",
    duration: "60 minuten",
    testimonial: "\"Na de behandeling zie ik dat mijn cyclus zich steeds meer normaliseert.\" - C.R.",
    category: "womb"
  },
  {
    id: 4,
    title: "Restoring Energy Massage",
    subtitle: "Reiki-infused energiebalans",
    description: "Is een reiki-infused massage waarbij ik contact maak met de energie die door jouw lichaam stroomt. De Restoring Energy Massage is een reiki-infused massage om jouw energie weer in balans te brengen.",
    duration: "75 minuten",
    testimonial: "\"Ik ben heel sterk teruggezet in mijn kracht en energie.\" - M.W.",
    category: "energy"
  },
  {
    id: 5,
    title: "Geboortetrauma",
    subtitle: "Verwerken en versterken",
    description: "Geboortetraumatherapie biedt effectieve zorg voor moeders met traumatische ervaringen rondom de geboorte of verlies van hun kindje. We richten ons op het versterken van het positieve en het verwerken van het negatieve aspect van jouw volledige ervaring.",
    duration: "90 minuten",
    testimonial: "\"het heeft een moeilijke situatie in mijn leven een plek gegeven.\" - S.H.",
    category: "energy"
  },
  {
    id: 6,
    title: "Breathe in, Breathe out",
    subtitle: "Transformerende ademkracht",
    description: "Ontdek de transformerende kracht van ademwerk bij Im Your Sis. Geworteld in eeuwenoude tradities biedt onze vernieuwende dienst een bewuste verbinding met jouw levensenergie, een bron van vitaliteit en balans.",
    duration: "45 minuten",
    testimonial: "\"Ik raad haar zeer zeker aan! Ik gun dit elke vrouw!\" - N.T.",
    category: "breathwork"
  },
  {
    id: 7,
    title: "Sacred Escapes",
    subtitle: "Transformerende reizen",
    description: "Duik diep in jouw innerlijke wereld tijdens onze transformerende retreats. In een veilige, ondersteunende omgeving kun je volledig loslaten en jezelf herverbinden met je authentieke zelf. Deze intensieve reizen bieden ruimte voor diepe healing en persoonlijke groei.",
    duration: "3-5 dagen",
    testimonial: "\"Een levensveranderende ervaring die ik nooit zal vergeten.\" - A.M.",
    category: "retreats"
  },
  {
    id: 8,
    title: "Vrouwencirkels",
    subtitle: "Samen groeien",
    description: "Kom samen met andere vrouwen en leer over de kracht van je vrouwelijkheid, baarmoeder en innerlijke wijsheid. Onze workshops combineren praktische technieken met diepgaande inzichten in een ondersteunende groepsetting.",
    duration: "2-4 uur",
    testimonial: "\"Zo fijn om te ervaren dat ik niet de enige ben. Veel geleerd!\" - K.V.",
    category: "workshops"
  }
];

// Tab configurations for zen version (using sacred journey naming)
const zenTabs: TabCategory[] = [
  { id: 'womb', name: 'Sacred Womb', description: 'Baarmoederheling', icon: '🌸' },
  { id: 'energy', name: 'Energy Flow', description: 'Energetische genezing', icon: '✨' },
  { id: 'breathwork', name: 'Sacred Breath', description: 'Heilige adem', icon: '🫁' },
  { id: 'retreats', name: 'Sacred Escapes', description: 'Heilige reizen', icon: '🕊️' },
  { id: 'workshops', name: 'Sister Circles', description: 'Vrouwencirkels', icon: '🌙' }
];

export default function HealingServicesSectionZen({ version = 'sacred' }: { version?: VersionType }) {
  const [activeTab, setActiveTab] = useState(zenTabs[0].id);
  const [expandedService, setExpandedService] = useState<number | null>(null);

  const toggleService = (id: number) => {
    setExpandedService(expandedService === id ? null : id);
  };

  const getFilteredServices = () => {
    return services.filter(service => service.category === activeTab);
  };

  const filteredServices = getFilteredServices();

  return (
    <section className="py-24 bg-white relative overflow-hidden">
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

      <div className="max-w-6xl mx-auto px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-light mb-8 text-stone-800 tracking-wide">
            Sacred Services
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">
            Heilige diensten ter ondersteuning van jouw reis terug naar heelheid
          </p>
        </motion.div>

        {/* Zen Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {zenTabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative group px-8 py-4 transition-all duration-500 font-light text-lg
                  ${activeTab === tab.id 
                    ? 'text-stone-800 border-b-2 border-stone-400' 
                    : 'text-stone-500 hover:text-stone-700 border-b border-transparent hover:border-stone-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl opacity-70">{tab.icon}</span>
                  <div className="text-center">
                    <div className="font-light tracking-wide">{tab.name}</div>
                    <div className="text-sm opacity-60 font-normal">{tab.description}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Zen line separator */}
        <div className="flex justify-center mb-16">
          <motion.div
            key={activeTab}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 60, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="h-[1px] bg-stone-300"
          />
        </div>

        {/* Services Grid */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
        >
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative h-full bg-white border border-stone-200/60 p-8 hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                
                <div className="relative z-10">
                  {/* Service Header */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-light mb-3 text-stone-800 tracking-wide">
                      {service.title}
                    </h3>
                    <p className="text-lg italic text-stone-600 mb-4 font-light">
                      {service.subtitle}
                    </p>
                    {/* Zen line */}
                    <div className="w-12 h-[1px] bg-stone-300 group-hover:w-16 transition-all duration-500" />
                  </div>

                  {/* Service Details */}
                  <div className="mb-8">
                    <div className="text-base leading-relaxed text-stone-700 mb-4 font-light">
                      <motion.div
                        initial={false}
                        animate={{ height: 'auto' }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        {expandedService === service.id ? (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            {service.description}
                          </motion.p>
                        ) : (
                          <motion.p
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {service.description.substring(0, 120)}...
                          </motion.p>
                        )}
                      </motion.div>
                    </div>
                    
                    {service.description.length > 120 && (
                      <motion.button
                        onClick={() => toggleService(service.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-sm text-stone-600 hover:text-stone-800 font-light mb-6 transition-colors duration-200 border-b border-transparent hover:border-stone-300"
                      >
                        {expandedService === service.id ? 'Minder lezen' : 'Lees verder'}
                      </motion.button>
                    )}
                    
                    <div className="flex justify-center mb-6">
                      <span className="bg-stone-100 px-4 py-2 text-sm text-stone-600 font-light tracking-wide">
                        {service.duration}
                      </span>
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div className="mb-8">
                    <p className="text-sm italic text-stone-500 mb-2 font-light text-center">
                      {service.testimonial}
                    </p>
                  </div>

                  {/* Zen CTA Buttons */}
                  <div className="flex flex-col gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-stone-800 text-white py-3 px-6 font-light text-lg tracking-wide hover:bg-stone-700 transition-all duration-300"
                      onClick={() => {
                        window.open(`mailto:info@imyoursis.nl?subject=Booking: ${service.title}&body=Hallo Samora,%0A%0AIk zou graag een afspraak willen maken voor ${service.title}.%0A%0AMijn voorkeur voor datum/tijd:%0A%0AHeb je nog vragen voor mij?%0A%0AMet vriendelijke groet,`, '_blank');
                      }}
                    >
                      Boek Sessie
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full border border-stone-300 text-stone-700 py-3 px-6 font-light text-lg tracking-wide hover:bg-stone-50 transition-all duration-300"
                    >
                      Meer Informatie
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Zen CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          {/* Zen line */}
          <div className="flex justify-center mb-12">
            <div className="w-16 h-[1px] bg-stone-300" />
          </div>
          
          <p className="text-lg text-stone-600 mb-8 font-light">
            Niet zeker welke sessie het beste bij je past?
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-stone-800 text-white py-4 px-8 font-light text-lg tracking-wide hover:bg-stone-700 transition-all duration-300"
              onClick={() => {
                window.open('mailto:info@imyoursis.nl?subject=Kennismakingsgesprek&body=Hallo Samora,%0A%0AIk zou graag een kennismakingsgesprek inplannen om te bespreken welke behandeling het beste bij mij past.%0A%0AMijn voorkeur voor datum/tijd:%0A%0AKorte beschrijving van waar ik mee bezig ben:%0A%0AMet vriendelijke groet,', '_blank');
              }}
            >
              Kennismakingsgesprek
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-stone-300 text-stone-700 py-4 px-8 font-light text-lg tracking-wide hover:bg-stone-50 transition-all duration-300"
            >
              Bekijk Tarieven
            </motion.button>
          </div>
          <p className="text-sm text-stone-400 mt-6 font-light">
            Neem contact op voor tarieven
          </p>
        </motion.div>
      </div>
    </section>
  );
}