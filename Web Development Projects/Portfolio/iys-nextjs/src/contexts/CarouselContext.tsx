'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CarouselContextType {
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  getCurrentSlideColor: () => string;
  getCurrentGradient: () => string;
}

const CarouselContext = createContext<CarouselContextType | undefined>(undefined);

const slideColors = {
  0: { color: 'purple', gradient: 'from-purple-900/15 via-purple-800/10 to-white' },
  1: { color: 'yellow', gradient: 'from-yellow-900/15 via-yellow-800/10 to-white' },
  2: { color: 'teal', gradient: 'from-teal-900/15 via-teal-800/10 to-white' },
  3: { color: 'pink', gradient: 'from-pink-900/15 via-pink-800/10 to-white' },
  4: { color: 'emerald', gradient: 'from-emerald-900/15 via-emerald-800/10 to-white' },
  5: { color: 'purple', gradient: 'from-purple-900/15 via-purple-800/10 to-white' },
};

export function CarouselProvider({ children }: { children: ReactNode }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const getCurrentSlideColor = () => {
    return slideColors[currentSlide as keyof typeof slideColors]?.color || 'purple';
  };

  const getCurrentGradient = () => {
    return slideColors[currentSlide as keyof typeof slideColors]?.gradient || 'from-purple-900/15 via-purple-800/10 to-white';
  };

  return (
    <CarouselContext.Provider value={{
      currentSlide,
      setCurrentSlide,
      getCurrentSlideColor,
      getCurrentGradient
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