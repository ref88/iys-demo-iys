import {
  formatDate,
  formatDateForInput,
  calculateAge,
  isMinor,
  isSchoolAge,
  getAgeGroup,
  isFutureDate,
  daysUntil,
} from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date correctly in Dutch locale', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date);
      expect(formatted).toBe('15 januari 2024');
    });

    it('should handle different date formats', () => {
      const isoDate = '2024-01-15T10:30:00Z';
      const formatted = formatDate(isoDate);
      expect(formatted).toBe('15 januari 2024');
    });

    it('should return empty string for invalid dates', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate('invalid-date')).toBe('');
    });

    it('should support different locales', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date, 'en-US');
      expect(formatted).toBe('January 15, 2024');
    });
  });

  describe('formatDateForInput', () => {
    it('should format date for form inputs', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDateForInput(date);
      expect(formatted).toBe('2024-01-15');
    });

    it('should handle string dates', () => {
      const formatted = formatDateForInput('2024-01-15');
      expect(formatted).toBe('2024-01-15');
    });

    it('should return empty string for invalid dates', () => {
      expect(formatDateForInput('')).toBe('');
      expect(formatDateForInput('invalid')).toBe('');
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = '1990-01-01';
      const age = calculateAge(birthDate);
      expect(age).toBeGreaterThan(30);
    });

    it('should return null for empty birth date', () => {
      expect(calculateAge('')).toBeNull();
      expect(calculateAge(null)).toBeNull();
    });

    it('should return null for invalid dates', () => {
      expect(calculateAge('invalid-date')).toBeNull();
    });
  });

  describe('isMinor', () => {
    it('should return true for minors', () => {
      const currentYear = new Date().getFullYear();
      const minorBirthDate = `${currentYear - 10}-01-01`;
      expect(isMinor(minorBirthDate)).toBe(true);
    });

    it('should return false for adults', () => {
      const currentYear = new Date().getFullYear();
      const adultBirthDate = `${currentYear - 25}-01-01`;
      expect(isMinor(adultBirthDate)).toBe(false);
    });
  });

  describe('isSchoolAge', () => {
    it('should return true for school age children', () => {
      const currentYear = new Date().getFullYear();
      const schoolAgeBirthDate = `${currentYear - 10}-01-01`;
      expect(isSchoolAge(schoolAgeBirthDate)).toBe(true);
    });

    it('should return false for too young children', () => {
      const currentYear = new Date().getFullYear();
      const tooYoungBirthDate = `${currentYear - 3}-01-01`;
      expect(isSchoolAge(tooYoungBirthDate)).toBe(false);
    });

    it('should return false for adults', () => {
      const currentYear = new Date().getFullYear();
      const adultBirthDate = `${currentYear - 25}-01-01`;
      expect(isSchoolAge(adultBirthDate)).toBe(false);
    });
  });

  describe('getAgeGroup', () => {
    it('should return correct age group for different ages', () => {
      const currentYear = new Date().getFullYear();

      expect(getAgeGroup(`${currentYear - 3}-01-01`)).toBe('0-4 jaar');
      expect(getAgeGroup(`${currentYear - 8}-01-01`)).toBe('5-11 jaar');
      expect(getAgeGroup(`${currentYear - 15}-01-01`)).toBe('12-17 jaar');
      expect(getAgeGroup(`${currentYear - 22}-01-01`)).toBe('18-24 jaar');
      expect(getAgeGroup(`${currentYear - 30}-01-01`)).toBe('25-34 jaar');
      expect(getAgeGroup(`${currentYear - 40}-01-01`)).toBe('35-49 jaar');
      expect(getAgeGroup(`${currentYear - 55}-01-01`)).toBe('50-64 jaar');
      expect(getAgeGroup(`${currentYear - 70}-01-01`)).toBe('65+ jaar');
    });

    it('should return "Onbekend" for invalid dates', () => {
      expect(getAgeGroup('')).toBe('Onbekend');
      expect(getAgeGroup('invalid')).toBe('Onbekend');
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      expect(isFutureDate(futureDateString)).toBe(true);
    });

    it('should return false for past dates', () => {
      expect(isFutureDate('2020-01-01')).toBe(false);
    });

    it('should return false for empty dates', () => {
      expect(isFutureDate('')).toBe(false);
    });
  });

  describe('daysUntil', () => {
    it('should calculate days until future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const futureDateString = futureDate.toISOString().split('T')[0];
      expect(daysUntil(futureDateString)).toBe(5);
    });

    it('should return null for past dates', () => {
      expect(daysUntil('2020-01-01')).toBeNull();
    });

    it('should return null for empty dates', () => {
      expect(daysUntil('')).toBeNull();
    });
  });
});
