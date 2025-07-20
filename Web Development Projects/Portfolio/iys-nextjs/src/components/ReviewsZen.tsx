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

export default function ReviewsZen() {
  const [expandedReview, setExpandedReview] = useState<number | null>(null);

  const toggleReview = (id: number) => {
    setExpandedReview(expandedReview === id ? null : id);
  };

  return (
    <section id="reviews" className="py-24 bg-white relative overflow-hidden">
      {/* Zen line */}
      <div className="flex justify-center mb-16">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 80, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1.5, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="h-[1px] bg-gray-400"
        />
      </div>

      <div className="max-w-6xl mx-auto px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-libre font-extralight text-gray-800 mb-8">
            Ervaringen
          </h2>
          <p className="text-sm text-gray-600 font-light tracking-[0.3em] uppercase">
            Authentieke verhalen van vrouwen die hun reis naar genezing hebben ondernomen
          </p>
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
              <div className="bg-white border border-gray-200 p-8 transition-all duration-500 hover:shadow-sm">
                {/* Rating Stars */}
                <div className="flex items-center mb-6">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-gray-400 text-sm">★</span>
                  ))}
                </div>

                {/* Review Content */}
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4 font-light text-lg">
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
                      <p className="text-gray-600 leading-relaxed text-base font-light">
                        {review.fullReview}
                      </p>
                    </motion.div>
                  )}
                  
                  <button
                    onClick={() => toggleReview(review.id)}
                    className="text-gray-400 hover:text-gray-600 text-sm font-light transition-colors duration-200 mt-2"
                  >
                    {expandedReview === review.id ? 'Minder lezen...' : 'Lees verder...'}
                  </button>
                </div>

                {/* Review Footer */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div>
                    <p className="font-libre font-light text-gray-800">{review.name}</p>
                    <p className="text-sm text-gray-500 font-light">{review.service}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-light text-gray-600">{review.name.charAt(0)}</span>
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
          transition={{ duration: 1.2, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <p className="text-lg text-gray-600 font-light mb-8">
            Wil jij ook jouw verhaal delen?
          </p>
          <button className="border-2 border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white px-12 py-4 font-libre font-light tracking-wide transition-all duration-500">
            Begin Jouw Reis
          </button>
        </motion.div>

        {/* Bottom zen line */}
        <div className="flex justify-center mt-16">
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 60, opacity: 1 }}
            transition={{ delay: 1.0, duration: 1.5, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="h-[1px] bg-gray-400"
          />
        </div>
      </div>
    </section>
  );
}