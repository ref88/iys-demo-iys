// Centralized date utilities for the VMS application

/**
 * Calculate age from birth date
 * @param {string} birthDate - Birth date in YYYY-MM-DD format
 * @returns {number|null} Age in years or null if invalid date
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) {
    return null;
  }

  const today = new Date();
  const birth = new Date(birthDate);

  // Check if birth date is valid
  if (isNaN(birth.getTime())) {
    return null;
  }

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Format date for display
 * @param {string} dateString - Date string to format
 * @param {string} locale - Locale for formatting (default: 'nl-NL')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, locale = 'nl-NL') => {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date for form inputs (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  if (!date) {
    return '';
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return dateObj.toISOString().split('T')[0];
};

/**
 * Check if a person is a minor (under 18)
 * @param {string} birthDate - Birth date in YYYY-MM-DD format
 * @returns {boolean} True if person is under 18
 */
export const isMinor = (birthDate) => {
  const age = calculateAge(birthDate);
  return age !== null && age < 18;
};

/**
 * Check if a person is of school age (5-16 years)
 * @param {string} birthDate - Birth date in YYYY-MM-DD format
 * @returns {boolean} True if person is of school age
 */
export const isSchoolAge = (birthDate) => {
  const age = calculateAge(birthDate);
  return age !== null && age >= 5 && age <= 16;
};

/**
 * Get age group classification
 * @param {string} birthDate - Birth date in YYYY-MM-DD format
 * @returns {string} Age group classification
 */
export const getAgeGroup = (birthDate) => {
  const age = calculateAge(birthDate);
  if (age === null) {
    return 'Onbekend';
  }

  if (age < 5) {
    return '0-4 jaar';
  }
  if (age < 12) {
    return '5-11 jaar';
  }
  if (age < 18) {
    return '12-17 jaar';
  }
  if (age < 25) {
    return '18-24 jaar';
  }
  if (age < 35) {
    return '25-34 jaar';
  }
  if (age < 50) {
    return '35-49 jaar';
  }
  if (age < 65) {
    return '50-64 jaar';
  }
  return '65+ jaar';
};

/**
 * Check if date is in the future
 * @param {string} dateString - Date string to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (dateString) => {
  if (!dateString) {
    return false;
  }

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date > today;
};

/**
 * Calculate days until a future date
 * @param {string} dateString - Future date string
 * @returns {number|null} Days until date or null if invalid/past date
 */
export const daysUntil = (dateString) => {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date <= today) {
    return null;
  }

  const timeDiff = date.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};
