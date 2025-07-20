'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Review {
  id: number;
  name: string;
  service: string;
  excerpt: string;
  fullReview: string;
  rating: number;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "N.T.",
    service: "Workshop",
    excerpt: "Ik raad haar zeer zeker aan! Ik gun dit elke vrouw!",
    fullReview: "Op mijn verjaardag wilde ik stilstaan bij groei, ontwikkeling en spiritualiteit met mijn closest sisters. Ik heb besloten groepsworkshops te doen. Hier kon Samora natuurlijk niet ontbreken. Door haar open houding is het makkelijk om los te komen. Haar vibe voelt veilig. We zijn naar binnen gegaan, hebben tot ons innerlijke kind en vrouwelijkheid gesproken onder begeleiding van Samora. We hebben opdrachten gekregen en hebben mooie gesprekken gevoerd. Samora haar begeleiding voelde natuurlijk, en ondanks de hele intieme onderwerpen, kon de groep toch loskomen. Ze heeft veel kennis en weet goed de vinger op de juiste plek te leggen. Ik heb veel meer inzichten gekregen en ben zoveel informatie rijker over de kracht en heling van mijn baarmoeder! Er zijn traantjes gelaten, we hebben taboes besproken en uiteraard ook veel gelachen. Ik wil Samora bedanken voor haar magische toevoeging aan deze avond en de handvatten die ze ons gegeven heeft om hier op verder te borduren. Ik raad haar zeer zeker aan! Ik gun dit elke vrouw!",
    rating: 5
  },
  {
    id: 2,
    name: "M.L.",
    service: "Restoring Energy Massage",
    excerpt: "Het was makkelijk om te boeken en ik was blij dat ik snel terecht kon.",
    fullReview: "Ik voelde dat ik het nodig had. Het was makkelijk om te boeken en ik was blij dat ik snel terecht kon. Bij aankomst voelde ik me meteen op mijn gemak. Samora stelde me gerust, haar kalme en empathische houding maakte het geheel heel ontspannen. De massage was verfijnd en professioneel uitgevoerd, en ik voelde dat Samora wist wat ze deed. Na afloop merkte ik meteen verschil. De druk en spanning in mijn rug waren verminderd, en ik voelde me veel meer ontspannen. De energie in mijn lichaam is weer in balans gebracht. Ik ben dankbaar dat ik deze behandeling ben ondergaan. Haar deskundigheid en zorgzaamheid hebben me geholpen om mijn lichaam en geest weer in harmonie te brengen. Ik zou het iedereen aanraden die behoefte heeft aan een herstellende massage.",
    rating: 5
  },
  {
    id: 3,
    name: "S.D.",
    service: "Diving Deep Womb Treatment",
    excerpt: "Het is nu 2 weken geleden en ik voel nog steeds de effecten.",
    fullReview: "Ik heb een hele mooie womb healing van Samora ontvangen. Het is nu 2 weken geleden en ik voel nog steeds de effecten. Ik voel me sterker en zelfverzekerder. Ik ben niet meer bang om mijn angsten onder ogen te zien. Puzzelstukjes vallen op zijn plek. Ik ben Samora heel dankbaar dat zij mij open en warm heeft ontvangen. Het kan eng zijn om je open te stellen bij iemand die je niet kent. Maar ik voelde mij meteen op mijn gemak. Ik kan deze behandeling aan iedereen aanraden die dichter bij zichzelf wilt komen, en niet bang is om de problemen op te lossen die soms zo diep in ons zijn geworteld. Samora heel erg bedankt!",
    rating: 5
  },
  {
    id: 4,
    name: "S.H.",
    service: "Restoring Energy Massage",
    excerpt: "het heeft een moeilijke situatie in mijn leven een plek gegeven.",
    fullReview: "Het was een speciale ervaring. Het was echt kalmerend. Ik weet niet hoe ik het beste kan uitleggen maar het heeft een moeilijke situatie in mijn leven een plek gegeven. ik heb zelfs gehuild omdat ik iets had meegemaakt een paar weken geleden, en ik had het nog geen plek kunnen geven maar na de massage heb ik gemerkt dat ik het een plek had gegeven en voelde ik me beter. Het was echt goed en voelde mij na de massages geweldig! Ik zou het graag nog een keer willen doen.",
    rating: 5
  },
  {
    id: 5,
    name: "M.E.",
    service: "Fertility Cyclus Massage",
    excerpt: "Samora heeft een bijzondere gave. Haar handen voelen prettig.",
    fullReview: "De Fertility Massage heeft mij op een andere manier kennis laten maken met mijn baarmoeder. Het voelde al jaren alsof de connectie met mijn baarmoeder was verstoord. Opgeslagen trauma en een heftige bevalling middels een keizersnede hebben er tevens aan bijgedragen dat ik besloot om de Energy in mijn baarmoeder te willen clearen, zodat ik mijn volgende zwangerschap bewuster zou kunnen en mogen meemaken. Samora heeft een bijzondere gave. Haar handen voelen prettig, en aan haar handelingen voel je dat ze weet wat ze doet.",
    rating: 5
  },
  {
    id: 6,
    name: "M.W.",
    service: "Restoring Energy Massage",
    excerpt: "Ik ben heel sterk teruggezet in mijn kracht en energie.",
    fullReview: "Ik heb mijn behandelingen ervaren als een stukje healing. Ik ben heel bewust geworden van mijzelf en mij ik. Ik ben heel sterk teruggezet in mijn kracht en energie. Heel veel bewustwording en open-minded. Het heeft mij aangesterkt om door te zetten en meer in mijzelf te geloven. Ik raad het aan om dit te doen en weer één te zijn met jezelf.",
    rating: 5
  }
];

export default function ReviewsSection() {
  const [expandedReview, setExpandedReview] = useState<number | null>(null);

  const toggleReview = (id: number) => {
    setExpandedReview(expandedReview === id ? null : id);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-pink-200/20 rounded-full"
            style={{
              top: `${15 + i * 20}%`,
              right: `${5 + i * 15}%`,
              animation: `particleFloat ${10 + i * 3}s ease-in-out infinite`
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
            Ervaringen
          </h2>
          <p className="text-xl font-dancing italic text-gray-600 mb-4">
            Authentieke verhalen van vrouwen die hun reis naar genezing hebben ondernomen
          </p>
          <div className="w-12 h-[1px] bg-gradient-to-r from-pink-300 to-transparent mx-auto" />
          
          {/* Review Highlights */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="text-gray-700 font-medium">5.0 gemiddelde waardering</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700 font-medium">100% aanraden</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-500">💜</span>
              <span className="text-gray-700 font-medium">{reviews.length} reviews</span>
            </div>
          </div>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white/70 backdrop-blur-[15px] border border-white/60 rounded-[25px] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.08)] transition-all duration-500 hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] hover:-translate-y-1">
                {/* Rating Stars */}
                <div className="flex items-center mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>

                {/* Review Content */}
                <div className="mb-6">
                  <p className="text-base leading-6 sm:leading-relaxed text-gray-700 mb-4 font-medium">
                    &quot;{review.excerpt}&quot;
                  </p>
                  
                  {expandedReview === review.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {review.fullReview}
                      </p>
                    </motion.div>
                  )}
                  
                  <button
                    onClick={() => toggleReview(review.id)}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200 mt-2"
                  >
                    {expandedReview === review.id ? 'Minder lezen...' : 'Lees verder...'}
                  </button>
                </div>

                {/* Review Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
                  <div>
                    <p className="font-libre font-bold text-gray-800">{review.name}</p>
                    <p className="text-sm text-gray-500">{review.service}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">{review.name.charAt(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Wil jij ook jouw verhaal delen?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-fill text-white py-4 px-8 rounded-xl font-libre font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Begin Jouw Reis
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}