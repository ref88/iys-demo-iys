import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  fallbackSrc = null,
  lazy = true,
  placeholder = 'user',
  onError = null,
  onLoad = null,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(lazy ? null : src);
  const [isLoading, setIsLoading] = useState(lazy);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) {
      return;
    }

    if (
      typeof window !== 'undefined' &&
      typeof IntersectionObserver !== 'undefined'
    ) {
      observerRef.current = new window.IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              setImageSrc(src);
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, isInView, src]);

  // Update image source when src prop changes
  useEffect(() => {
    if (isInView && src !== imageSrc) {
      setImageSrc(src);
      setHasError(false);
      setIsLoading(true);
    }
  }, [src, isInView, imageSrc]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);

    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      return;
    }

    setHasError(true);
    onError?.();
  };

  // Generate fallback based on name
  const generateFallback = (name) => {
    if (!name) {
      return null;
    }

    // Use DiceBear for consistent avatars
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=3b82f6&textColor=ffffff`;
  };

  const getFallbackSrc = () => {
    if (fallbackSrc) {
      return fallbackSrc;
    }
    if (alt) {
      return generateFallback(alt);
    }
    return null;
  };

  // Show placeholder while loading or if lazy loading hasn't triggered
  if (!isInView || isLoading) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        {...props}
      >
        {placeholder === 'user' ? (
          <User className='w-6 h-6 text-gray-400' />
        ) : (
          <div className='animate-pulse bg-gray-300 w-full h-full rounded' />
        )}
      </div>
    );
  }

  // Show error state with fallback
  if (hasError) {
    const fallback = getFallbackSrc();

    if (fallback) {
      return (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <img
          ref={imgRef}
          src={fallback}
          alt={alt}
          className={className}
          onError={() => setHasError(true)}
          {...props}
        />
      );
    }

    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        {...props}
      >
        <User className='w-6 h-6 text-gray-400' />
      </div>
    );
  }

  // Show actual image
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default OptimizedImage;
