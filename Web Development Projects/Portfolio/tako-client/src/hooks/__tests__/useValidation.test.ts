import { renderHook } from '@testing-library/react';
import { useValidation } from '../useValidation';

describe('useValidation Hook', () => {
  it('should provide validation functions', () => {
    const { result } = renderHook(() => useValidation());

    expect(typeof result.current.validateBSN).toBe('function');
    expect(typeof result.current.validateEmail).toBe('function');
    expect(typeof result.current.validatePhone).toBe('function');
    expect(typeof result.current.validateRequired).toBe('function');
    expect(typeof result.current.validateDate).toBe('function');
    expect(typeof result.current.validateAge).toBe('function');
    expect(typeof result.current.validateResidentForm).toBe('function');
    expect(typeof result.current.validateLeaveRequest).toBe('function');
  });

  it('should validate BSN correctly', () => {
    const { result } = renderHook(() => useValidation());

    // Valid BSN
    const validResult = result.current.validateBSN('123456782');
    expect(validResult.valid).toBe(true);
    expect(validResult.message).toBe('');

    // Invalid BSN - wrong length
    const invalidLengthResult = result.current.validateBSN('12345');
    expect(invalidLengthResult.valid).toBe(false);
    expect(invalidLengthResult.message).toBe('BSN moet 9 cijfers bevatten');

    // Invalid BSN - wrong checksum
    const invalidChecksumResult = result.current.validateBSN('123456789');
    expect(invalidChecksumResult.valid).toBe(false);
    expect(invalidChecksumResult.message).toBe('Ongeldig BSN nummer');

    // Empty BSN should be valid (optional field)
    const emptyResult = result.current.validateBSN('');
    expect(emptyResult.valid).toBe(true);
  });

  it('should validate email correctly', () => {
    const { result } = renderHook(() => useValidation());

    // Valid email
    const validResult = result.current.validateEmail('test@example.com');
    expect(validResult.valid).toBe(true);
    expect(validResult.message).toBe('');

    // Invalid email
    const invalidResult = result.current.validateEmail('invalid-email');
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.message).toBe('Ongeldig email adres');

    // Empty email should be valid (optional field)
    const emptyResult = result.current.validateEmail('');
    expect(emptyResult.valid).toBe(true);
  });

  it('should validate phone numbers correctly', () => {
    const { result } = renderHook(() => useValidation());

    // Valid Dutch phone number
    const validResult = result.current.validatePhone('0612345678');
    expect(validResult.valid).toBe(true);
    expect(validResult.message).toBe('');

    // Invalid phone - too short
    const shortResult = result.current.validatePhone('123');
    expect(shortResult.valid).toBe(false);
    expect(shortResult.message).toBe(
      'Telefoonnummer moet minimaal 10 cijfers bevatten'
    );

    // Empty phone should be valid (optional field)
    const emptyResult = result.current.validatePhone('');
    expect(emptyResult.valid).toBe(true);
  });

  it('should validate required fields correctly', () => {
    const { result } = renderHook(() => useValidation());

    // Valid required field
    const validResult = result.current.validateRequired('John', 'Voornaam');
    expect(validResult.valid).toBe(true);
    expect(validResult.message).toBe('');

    // Invalid required field - empty
    const emptyResult = result.current.validateRequired('', 'Voornaam');
    expect(emptyResult.valid).toBe(false);
    expect(emptyResult.message).toBe('Voornaam is verplicht');

    // Invalid required field - whitespace only
    const whitespaceResult = result.current.validateRequired('   ', 'Voornaam');
    expect(whitespaceResult.valid).toBe(false);
    expect(whitespaceResult.message).toBe('Voornaam is verplicht');
  });

  it('should validate dates correctly', () => {
    const { result } = renderHook(() => useValidation());

    // Valid date
    const validResult = result.current.validateDate(
      '2024-01-01',
      'Geboortedatum'
    );
    expect(validResult.valid).toBe(true);
    expect(validResult.message).toBe('');

    // Invalid date
    const invalidResult = result.current.validateDate(
      'invalid-date',
      'Geboortedatum'
    );
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.message).toBe(
      'Geboortedatum moet een geldige datum zijn'
    );

    // Empty date should be valid (optional field)
    const emptyResult = result.current.validateDate('', 'Geboortedatum');
    expect(emptyResult.valid).toBe(true);
  });

  it('should validate age correctly', () => {
    const { result } = renderHook(() => useValidation());

    // Valid age
    const validBirthDate = '1990-01-01';
    const validResult = result.current.validateAge(validBirthDate);
    expect(validResult.valid).toBe(true);
    expect(validResult.message).toBe('');

    // Future birth date should be invalid
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureResult = result.current.validateAge(
      futureDate.toISOString().split('T')[0] || ''
    );
    expect(futureResult.valid).toBe(false);
    expect(futureResult.message).toBe(
      'Geboortedatum kan niet in de toekomst liggen'
    );

    // Age too old
    const tooOldResult = result.current.validateAge('1800-01-01', 0, 150);
    expect(tooOldResult.valid).toBe(false);
    expect(tooOldResult.message).toBe(
      'Leeftijd moet tussen 0 en 150 jaar zijn'
    );
  });

  it('should validate resident form correctly', () => {
    const { result } = renderHook(() => useValidation());

    // Valid form
    const validForm = {
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1990-01-01',
      email: 'john@example.com',
      phone: '0612345678',
    };

    const validResult = result.current.validateResidentForm(validForm);
    expect(validResult.valid).toBe(true);
    expect(Object.keys(validResult.errors)).toHaveLength(0);

    // Invalid form
    const invalidForm = {
      firstName: '',
      lastName: '',
      email: 'invalid-email',
      phone: '123',
    };

    const invalidResult = result.current.validateResidentForm(invalidForm);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.firstName).toBe('Voornaam is verplicht');
    expect(invalidResult.errors.lastName).toBe('Achternaam is verplicht');
    expect(invalidResult.errors.email).toBe('Ongeldig email adres');
    expect(invalidResult.errors.phone).toBe(
      'Telefoonnummer moet minimaal 10 cijfers bevatten'
    );
  });
});
