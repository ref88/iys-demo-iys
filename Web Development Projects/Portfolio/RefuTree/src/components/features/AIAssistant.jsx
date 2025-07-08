import React, { useState, useEffect } from 'react';
import { Bot, Lightbulb, X, ChevronRight, Sparkles, MessageCircle } from 'lucide-react';

const AIAssistant = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const tips = [
    {
      title: "Slimme Planning",
      content: "Gebruik AI scheduling om automatisch de beste shifts te maken op basis van beschikbaarheid en vaardigheden!",
      icon: "🤖"
    },
    {
      title: "Snelle Acties",
      content: "Druk op 'N' voor nieuwe bewoner, 'S' voor shift planning, of 'I' voor incident rapport.",
      icon: "⚡"
    },
    {
      title: "Labels & Organisatie",
      content: "Gebruik labels om bewoners te categoriseren. Dit helpt bij betere planning en rapportage.",
      icon: "🏷️"
    },
    {
      title: "Dashboard Insights",
      content: "Bekijk je dashboard voor real-time statistieken en trends in je locatie.",
      icon: "📊"
    },
    {
      title: "Export Data",
      content: "Exporteer je data voor rapportages of backup doeleinden via de Data Export functie.",
      icon: "📤"
    }
  ];

  useEffect(() => {
    // Toon AI assistent na 3 seconden
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, currentTip]);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-16 right-6 z-50">
      {/* AI Assistant Bubble */}
      <div 
        className={`
          relative transition-all duration-500 ease-out
          ${isExpanded ? 'w-80 h-96' : 'w-16 h-16'}
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        {/* Main AI Character */}
        <div 
          className={`
            absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 
            rounded-full shadow-lg cursor-pointer transition-all duration-300
            hover:scale-110 hover:shadow-xl flex items-center justify-center
            ${isExpanded ? 'scale-75' : 'scale-100'}
          `}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Bot className="w-8 h-8 text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
        </div>

        {/* Expanded AI Assistant Panel */}
        {isExpanded && (
          <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span className="font-semibold">AI Assistent</span>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Tip Navigation */}
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={prevTip}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <span className="text-sm text-gray-500">
                  Tip {currentTip + 1} van {tips.length}
                </span>
                <button 
                  onClick={nextTip}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Current Tip */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{tips[currentTip].icon}</span>
                  <h3 className="font-semibold text-gray-800">{tips[currentTip].title}</h3>
                </div>
                
                <div className="relative">
                  <p className={`text-gray-600 leading-relaxed ${isTyping ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}>
                    {tips[currentTip].content}
                  </p>
                  {isTyping && (
                    <div className="absolute bottom-0 left-0 w-2 h-4 bg-blue-500 animate-pulse rounded-sm" />
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Snelle Acties</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center space-x-2 p-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>Help</span>
                  </button>
                  <button className="flex items-center space-x-2 p-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                    <Lightbulb className="w-4 h-4" />
                    <span>Tips</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Animation */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce opacity-75" />
      </div>
    </div>
  );
};

export default AIAssistant; 