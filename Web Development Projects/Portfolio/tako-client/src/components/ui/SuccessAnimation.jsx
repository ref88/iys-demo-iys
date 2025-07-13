import React, { useState, useEffect } from 'react';

const SuccessAnimation = ({
  show = false,
  onComplete,
  type = 'save',
  duration = 2000,
  size = 'large', // 'small', 'medium', 'large'
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!isVisible) {
    return null;
  }

  const sizeClasses = {
    small: { circle: 'w-8 h-8', checkmark: 'w-4 h-2', text: 'text-sm' },
    medium: { circle: 'w-12 h-12', checkmark: 'w-6 h-3', text: 'text-base' },
    large: { circle: 'w-16 h-16', checkmark: 'w-8 h-4', text: 'text-lg' },
  };

  const sizes = sizeClasses[size];

  const getSuccessMessage = () => {
    switch (type) {
      case 'update':
        return {
          title: 'Bijgewerkt!',
          subtitle: 'Wijzigingen succesvol opgeslagen',
        };
      case 'delete':
        return { title: 'Verwijderd!', subtitle: 'Item succesvol verwijderd' };
      case 'add':
        return { title: 'Toegevoegd!', subtitle: 'Succesvol toegevoegd' };
      case 'save':
      default:
        return { title: 'Opgeslagen!', subtitle: 'Succesvol opgeslagen' };
    }
  };

  const message = getSuccessMessage();

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes successPulse {
          0% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); 
          }
          50% { 
            transform: scale(1.02); 
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); 
          }
          100% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); 
          }
        }
        
        @keyframes checkmarkBounce {
          0% { 
            transform: scale(0) rotate(45deg); 
            opacity: 0; 
          }
          50% { 
            transform: scale(1.3) rotate(45deg); 
            opacity: 1; 
          }
          100% { 
            transform: scale(1) rotate(45deg); 
            opacity: 1; 
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes slideInSuccess {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeInSuccess {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .success-pulse {
          animation: successPulse 0.6s ease-out;
        }
        
        .success-checkmark {
          animation: checkmarkBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .success-ripple {
          animation: ripple 0.6s ease-out;
        }
        
        .slide-in-success {
          animation: slideInSuccess 0.5s ease-out;
        }

        .fade-in-success {
          animation: fadeInSuccess 0.3s ease-out;
        }
      `}</style>

      {/* Animation Overlay */}
      <div className='absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl fade-in-success'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='relative'>
            {/* Success Circle */}
            <div
              className={`${sizes.circle} bg-green-500 rounded-full flex items-center justify-center success-pulse`}
            >
              {/* Checkmark */}
              <div
                className={`${sizes.checkmark} border-b-4 border-r-4 border-white transform rotate-45 success-checkmark`}
              />
            </div>
            {/* Ripple Effect */}
            <div
              className={`absolute inset-0 ${sizes.circle} bg-green-500 rounded-full success-ripple`}
            />
          </div>

          {/* Success Message */}
          <div className='text-center slide-in-success'>
            <h3 className={`font-semibold text-green-700 mb-1 ${sizes.text}`}>
              {message.title}
            </h3>
            <p className='text-sm text-green-600'>{message.subtitle}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessAnimation;
