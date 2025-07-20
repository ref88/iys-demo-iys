'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CarouselContextType {
  currentSlide: number;
  setCurrentSlide: (slide: number | ((prev: number) => number)) => void;
  getCurrentSlideColor: () => string;
  getCurrentGradient: () => string;
  getHeroGradient: () => string;
  getHeroOverlay: () => string;
}

const CarouselContext = createContext<CarouselContextType | undefined>(undefined);

const slideColors = {
  0: { 
    color: 'purple', 
    gradient: 'from-purple-900/15 via-purple-800/10 to-white',
    heroGradient: 'from-purple-500/70 via-purple-400/50 to-purple-300/30',
    heroOverlay: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(150, 106, 162, 0.6), rgba(150, 106, 162, 0))'
  },
  1: { 
    color: 'yellow', 
    gradient: 'from-yellow-900/15 via-yellow-800/10 to-white',
    heroGradient: 'from-yellow-600/70 via-yellow-500/50 to-yellow-400/30',
    heroOverlay: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(180, 144, 48, 0.6), rgba(180, 144, 48, 0))'
  },
  2: { 
    color: 'teal', 
    gradient: 'from-teal-900/15 via-teal-800/10 to-white',
    heroGradient: 'from-teal-500/70 via-teal-400/50 to-teal-300/30',
    heroOverlay: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(62, 224, 207, 0.6), rgba(62, 224, 207, 0))'
  },
  3: { 
    color: 'pink', 
    gradient: 'from-pink-900/15 via-pink-800/10 to-white',
    heroGradient: 'from-pink-400/70 via-pink-300/50 to-pink-200/30',
    heroOverlay: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(244, 194, 194, 0.6), rgba(244, 194, 194, 0))'
  },
  4: { 
    color: 'emerald', 
    gradient: 'from-emerald-900/15 via-emerald-800/10 to-white',
    heroGradient: 'from-emerald-600/70 via-emerald-500/50 to-emerald-400/30',
    heroOverlay: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(52, 168, 133, 0.6), rgba(52, 168, 133, 0))'
  },
  5: { 
    color: 'purple', 
    gradient: 'from-purple-900/15 via-purple-800/10 to-white',
    heroGradient: 'from-purple-500/70 via-purple-400/50 to-purple-300/30',
    heroOverlay: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(150, 106, 162, 0.6), rgba(150, 106, 162, 0))'
  },
};

export function CarouselProvider({ children }: { children: ReactNode }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const getCurrentSlideColor = () => {
    return slideColors[currentSlide as keyof typeof slideColors]?.color || 'purple';
  };

  const getCurrentGradient = () => {
    return slideColors[currentSlide as keyof typeof slideColors]?.gradient || 'from-purple-900/15 via-purple-800/10 to-white';
  };

  const getHeroGradient = () => {
    return slideColors[currentSlide as keyof typeof slideColors]?.heroGradient || 'from-purple-500/70 via-purple-400/50 to-purple-300/30';
  };

  const getHeroOverlay = () => {
    return slideColors[currentSlide as keyof typeof slideColors]?.heroOverlay || 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(150, 106, 162, 0.6), rgba(150, 106, 162, 0))';
  };

  return (
    <CarouselContext.Provider value={{
      currentSlide,
      setCurrentSlide,
      getCurrentSlideColor,
      getCurrentGradient,
      getHeroGradient,
      getHeroOverlay
    }}>
      {children}
    </CarouselContext.Provider>
  );
}

export function useCarousel() {
  const context = useContext(CarouselContext);
  if (context === undefined) {
    throw new Error('useCarousel must be used within a CarouselProvider');
  }
  return context;
}