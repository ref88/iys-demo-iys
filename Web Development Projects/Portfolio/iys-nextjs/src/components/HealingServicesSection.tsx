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
  gradient: string;
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
    gradient: "from-purple-100/20 to-lavender-50/10",
    category: "womb"
  },
  {
    id: 2,
    title: "Treasure Steam",
    subtitle: "Heilende stoomceremonie",
    description: "Een zachte en diep genezende stoombehandeling voor de onderbuik en baarmoeder. Treasure Steam is een eeuwenoude praktijk die het vrouwelijk lichaam reinigt, voedt en in balans brengt door middel van medicinale kruiden en warmte.",
    duration: "45 minuten",
    testimonial: "\"Zo'n liefdevolle en helende ervaring. Ik voelde me compleet genesteld.\" - L.K.",
    gradient: "from-teal-100/20 to-emerald-50/10",
    category: "womb"
  },
  {
    id: 3,
    title: "Fertility Cyclus Massage",
    subtitle: "Voorbereiden op nieuw leven",
    description: "Ben je al een tijdje bezig om zwanger te worden (en/of te blijven) zonder het gewenste resultaat? Of ben je juist bewust bezig met het voorbereiden van je lichaam op een mogelijke zwangerschap? Dan nodig ik je uit om kennis te maken met de bijzondere wereld van vruchtbaarheidsmassage.",
    duration: "60 minuten",
    testimonial: "\"Na de behandeling zie ik dat mijn cyclus zich steeds meer normaliseert.\" - C.R.",
    gradient: "from-rose-100/20 to-pink-50/10",
    category: "womb"
  },
  {
    id: 4,
    title: "Restoring Energy Massage",
    subtitle: "Reiki-infused energiebalans",
    description: "Is een reiki-infused massage waarbij ik contact maak met de energie die door jouw lichaam stroomt. De Restoring Energy Massage is een reiki-infused massage om jouw energie weer in balans te brengen.",
    duration: "75 minuten",
    testimonial: "\"Ik ben heel sterk teruggezet in mijn kracht en energie.\" - M.W.",
    gradient: "from-emerald-100/20 to-green-50/10",
    category: "energy"
  },
  {
    id: 5,
    title: "Geboortetrauma",
    subtitle: "Verwerken en versterken",
    description: "Geboortetraumatherapie biedt effectieve zorg voor moeders met traumatische ervaringen rondom de geboorte of verlies van hun kindje. We richten ons op het versterken van het positieve en het verwerken van het negatieve aspect van jouw volledige ervaring.",
    duration: "90 minuten",
    testimonial: "\"het heeft een moeilijke situatie in mijn leven een plek gegeven.\" - S.H.",
    gradient: "from-amber-100/20 to-yellow-50/10",
    category: "energy"
  },
  {
    id: 6,
    title: "Breathe in, Breathe out",
    subtitle: "Transformerende ademkracht",
    description: "Ontdek de transformerende kracht van ademwerk bij Im Your Sis. Geworteld in eeuwenoude tradities biedt onze vernieuwende dienst een bewuste verbinding met jouw levensenergie, een bron van vitaliteit en balans.",
    duration: "45 minuten",
    testimonial: "\"Ik raad haar zeer zeker aan! Ik gun dit elke vrouw!\" - N.T.",
    gradient: "from-teal-100/20 to-cyan-50/10",
    category: "breathwork"
  },
  {
    id: 7,
    title: "Retreats",
    subtitle: "Transformerende reizen",
    description: "Duik diep in jouw innerlijke wereld tijdens onze transformerende retreats. In een veilige, ondersteunende omgeving kun je volledig loslaten en jezelf herverbinden met je authentieke zelf. Deze intensieve reizen bieden ruimte voor diepe healing en persoonlijke groei.",
    duration: "3-5 dagen",
    testimonial: "\"Een levensveranderende ervaring die ik nooit zal vergeten.\" - A.M.",
    gradient: "from-indigo-100/20 to-violet-50/10",
    category: "retreats"
  },
  {
    id: 8,
    title: "Workshops",
    subtitle: "Leren en groeien samen",
    description: "Kom samen met andere vrouwen en leer over de kracht van je vrouwelijkheid, baarmoeder en innerlijke wijsheid. Onze workshops combineren praktische technieken met diepgaande inzichten in een ondersteunende groepsetting.",
    duration: "2-4 uur",
    testimonial: "\"Zo fijn om te ervaren dat ik niet de enige ben. Veel geleerd!\" - K.V.",
    gradient: "from-orange-100/20 to-amber-50/10",
    category: "workshops"
  }
];

// Tab configurations for different versions
const tabConfigurations = {
  eventFocus: [
    { id: 'womb', name: 'Womb Healing & Care', description: 'Baarmoedergericht werk', icon: '🌸' },
    { id: 'energy', name: 'Energetic Healing', description: 'Energiewerk & trauma', icon: '✨' },
    { id: 'breathwork', name: 'Breathwork', description: 'Ademwerk sessies', icon: '🫁' },
    { id: 'retreats', name: 'Aankomende Retreats', description: 'Geplande reizen', icon: '🏔️' },
    { id: 'workshops', name: 'Groepsworkshops', description: 'Samen leren', icon: '👥' }
  ],
  experiences: [
    { id: 'womb', name: 'Womb Healing & Care', description: 'Baarmoedergericht werk', icon: '🌸' },
    { id: 'energy', name: 'Energetic Healing', description: 'Energiewerk & trauma', icon: '✨' },
    { id: 'breathwork', name: 'Breathwork', description: 'Ademwerk sessies', icon: '🫁' },
    { id: 'community', name: 'Community Experiences', description: 'Groepsbelevingen', icon: '🌟' }
  ],
  sacred: [
    { id: 'womb', name: 'Womb Healing & Care', description: 'Baarmoedergericht werk', icon: '🌸' },
    { id: 'energy', name: 'Energetic Healing', description: 'Energiewerk & trauma', icon: '✨' },
    { id: 'breathwork', name: 'Breathwork', description: 'Ademwerk sessies', icon: '🫁' },
    { id: 'retreats', name: 'Sacred Escapes', description: 'Heilige reizen', icon: '🕊️' },
    { id: 'workshops', name: 'Vrouwencirkels', description: 'Samen groeien', icon: '🌙' }
  ]
};

export default function HealingServicesSection({ version = 'eventFocus' }: { version?: VersionType }) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(tabConfigurations[version][0].id);

  const toggleService = (id: number) => {
    setExpandedService(expandedService === id ? null : id);
  };

  const currentTabs = tabConfigurations[version];
  
  const getFilteredServices = () => {
    if (version === 'experiences' && activeTab === 'community') {
      return services.filter(service => service.category === 'retreats' || service.category === 'workshops');
    }
    return services.filter(service => service.category === activeTab);
  };

  const filteredServices = getFilteredServices();

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

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-libre font-bold mb-6" style={{color: '#674870'}}>
            Healing Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Heilige diensten ter ondersteuning van jouw reis terug naar heelheid, ontworpen met liefde en eeuwenoude wijsheid.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {currentTabs.map((tab, index) => (
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
                  relative group px-6 py-4 rounded-2xl font-medium text-lg transition-all duration-300
                  ${activeTab === tab.id 
                    ? 'bg-white/80 backdrop-blur-[15px] text-purple-700 shadow-[0_8px_25px_rgba(0,0,0,0.1)]' 
                    : 'bg-white/40 backdrop-blur-[10px] text-gray-600 hover:bg-white/60 hover:text-purple-600'
                  }
                  border border-white/50 hover:border-purple-200/50
                `}
              >
                {/* Active tab indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-pink-100/30 rounded-2xl"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                
                <div className="relative z-10 flex items-center gap-3">
                  <span className="text-2xl">{tab.icon}</span>
                  <div className="text-center">
                    <div className="font-libre font-semibold">{tab.name}</div>
                    <div className="text-sm opacity-70 font-normal">{tab.description}</div>
                  </div>
                </div>

                {/* Subtle glow effect */}
                <div className={`
                  absolute -inset-1 bg-gradient-to-r from-purple-100/20 via-pink-100/20 to-purple-100/20 
                  rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10
                  blur-xl
                `} />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredCard(service.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group cursor-pointer"
            >
              <div className={`
                relative h-full bg-white/60 backdrop-blur-[15px] border border-white/50 
                rounded-[30px] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.08)]
                transition-all duration-500 ease-out
                ${hoveredCard === service.id ? 'transform -translate-y-2 shadow-[0_25px_50px_rgba(0,0,0,0.15)]' : ''}
              `}>
                {/* Gradient Background */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${service.gradient} 
                  rounded-[30px] opacity-0 group-hover:opacity-100 
                  transition-opacity duration-500
                `} />
                
                <div className="relative z-10">
                  {/* Service Header */}
                  <div className="mb-6">
                    <h3 className="text-xl sm:text-2xl font-libre font-bold mb-2 transition-colors duration-300" style={{color: '#674870'}}>
                      {service.title}
                    </h3>
                    <p className="text-xl font-dancing italic text-gray-600 mb-4">
                      {service.subtitle}
                    </p>
                    <div className="w-12 h-[1px] bg-gradient-to-r from-pink-300 to-transparent group-hover:w-16 transition-all duration-500" />
                  </div>

                  {/* Service Details */}
                  <div className="mb-6">
                    <div className="text-base leading-6 sm:leading-relaxed text-gray-700 mb-4">
                      <motion.div
                        initial={false}
                        animate={{ height: expandedService === service.id ? 'auto' : 'auto' }}
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
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium mb-4 transition-colors duration-200"
                      >
                        {expandedService === service.id ? 'Minder lezen' : 'Lees verder'}
                      </motion.button>
                    )}
                    
                    <div className="flex justify-center mb-4">
                      <span className="bg-gray-100/70 px-4 py-2 rounded-full text-sm text-gray-600">
                        {service.duration}
                      </span>
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div className="mb-6">
                    <p className="text-sm italic text-gray-600 mb-2">
                      {service.testimonial}
                    </p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full btn-fill text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => {
                        // Direct booking logic
                        window.open(`mailto:info@imyoursis.nl?subject=Booking: ${service.title}&body=Hallo Samora,%0A%0AIk zou graag een afspraak willen maken voor ${service.title}.%0A%0AMijn voorkeur voor datum/tijd:%0A%0AHeb je nog vragen voor mij?%0A%0AMet vriendelijke groet,`, '_blank');
                      }}
                    >
                      Boek Nu
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-white/70 border border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-white/90 transition-all duration-300"
                    >
                      Meer Info
                    </motion.button>
                  </div>
                </div>

                {/* Subtle glow effect */}
                <div className={`
                  absolute -inset-1 bg-gradient-to-r from-pink-100/20 via-purple-100/20 to-pink-100/20 
                  rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10
                  blur-xl
                `} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Niet zeker welke behandeling het beste bij je past?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-fill text-white py-4 px-8 rounded-xl font-libre font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                window.open('mailto:info@imyoursis.nl?subject=Kennismakingsgesprek&body=Hallo Samora,%0A%0AIk zou graag een kennismakingsgesprek inplannen om te bespreken welke behandeling het beste bij mij past.%0A%0AMijn voorkeur voor datum/tijd:%0A%0AKorte beschrijving van waar ik mee bezig ben:%0A%0AMet vriendelijke groet,', '_blank');
              }}
            >
              Boek Kennismakingsgesprek
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/70 border border-gray-200 text-gray-700 py-4 px-8 rounded-xl font-libre font-medium text-lg hover:bg-white/90 transition-all duration-300"
            >
              Bekijk Tarieven
            </motion.button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Neem contact op voor tarieven
          </p>
        </motion.div>
      </div>
    </section>
  );
}