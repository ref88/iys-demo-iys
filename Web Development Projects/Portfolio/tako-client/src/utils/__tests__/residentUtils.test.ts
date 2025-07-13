import {
  calculateAge,
  getAutomaticLabels,
  formatResidentName,
} from '../residentUtils';
import { Resident } from '../../types';

describe('residentUtils', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = '1990-01-01';
      const age = calculateAge(birthDate);
      expect(age).toBeGreaterThan(30);
    });

    it('should return null for empty birth date', () => {
      expect(calculateAge('')).toBeNull();
      expect(calculateAge(undefined)).toBeNull();
    });
  });

  describe('getAutomaticLabels', () => {
    it('should return cat label for cats', () => {
      const labels = getAutomaticLabels('2020-01-01', null, 'cat');
      expect(labels).toContain('l10');
    });

    it('should return dog label for dogs', () => {
      const labels = getAutomaticLabels('2020-01-01', null, 'dog');
      expect(labels).toContain('l11');
    });

    it('should return minor label for children', () => {
      const labels = getAutomaticLabels('2010-01-01', null, 'human');
      expect(labels).toContain('l3'); // Minderjarig
    });

    it('should return baby label for babies', () => {
      const currentYear = new Date().getFullYear();
      const babyBirthDate = `${currentYear - 1}-01-01`;
      const labels = getAutomaticLabels(babyBirthDate, null, 'human');
      expect(labels).toContain('l8'); // Baby
    });
  });

  describe('formatResidentName', () => {
    it('should return full name when available', () => {
      const resident: Resident = {
        id: 'r1',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        labels: [],
        registrationDate: '2024-01-01',
        emergencyContact: {
          firstName: '',
          lastName: '',
          gender: '',
          relationship: '',
          phone: '',
        },
        type: 'human',
        archived: false,
      };

      expect(formatResidentName(resident)).toBe('John Doe');
    });

    it('should combine first and last name when name is not available', () => {
      const resident: Resident = {
        id: 'r1',
        firstName: 'John',
        lastName: 'Doe',
        labels: [],
        registrationDate: '2024-01-01',
        emergencyContact: {
          firstName: '',
          lastName: '',
          gender: '',
          relationship: '',
          phone: '',
        },
        type: 'human',
        archived: false,
      };

      expect(formatResidentName(resident)).toBe('John Doe');
    });

    it('should return single name when only one is available', () => {
      const resident: Resident = {
        id: 'r1',
        firstName: 'John',
        lastName: '',
        labels: [],
        registrationDate: '2024-01-01',
        emergencyContact: {
          firstName: '',
          lastName: '',
          gender: '',
          relationship: '',
          phone: '',
        },
        type: 'human',
        archived: false,
      };

      expect(formatResidentName(resident)).toBe('John');
    });

    it('should return "Onbekend" when no name is available', () => {
      const resident: Resident = {
        id: 'r1',
        firstName: '',
        lastName: '',
        labels: [],
        registrationDate: '2024-01-01',
        emergencyContact: {
          firstName: '',
          lastName: '',
          gender: '',
          relationship: '',
          phone: '',
        },
        type: 'human',
        archived: false,
      };

      expect(formatResidentName(resident)).toBe('Onbekend');
    });
  });
});
