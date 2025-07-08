import React, { useState } from 'react';

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileImage({ src, name, className = '', size = 48, alt = '' }) {
  const [error, setError] = useState(false);
  const initials = getInitials(name);
  const dimension = typeof size === 'number' ? `${size}px` : size;

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold border ${className}`}
        style={{ width: dimension, height: dimension, fontSize: `calc(${dimension} / 2)` }}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name}
      className={`object-cover rounded-full border ${className}`}
      style={{ width: dimension, height: dimension }}
      onError={() => setError(true)}
    />
  );
} 