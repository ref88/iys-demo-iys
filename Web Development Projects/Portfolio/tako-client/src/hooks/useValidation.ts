import { useCallback } from 'react';
import { ValidationResult, ResidentForm, LeaveRequest } from '@/types';

export const useValidation = () => {
  const validateBSN = useCallback((bsn?: string): ValidationResult => {
    if (!bsn) {
      return { valid: true, message: '' };
    }

    const cleanBSN = bsn.replace(/\D/g, '');

    if (cleanBSN.length !== 9) {
      return { valid: false, message: 'BSN moet 9 cijfers bevatten' };
    }

    const digits = cleanBSN.split('').map(Number);
    const checksum = digits.slice(0, 8).reduce((sum, digit, index) => {
      return sum + digit * (9 - index);
    }, 0);

    const remainder = checksum % 11;
    const isValid =
      remainder === digits[8] || (remainder === 10 && digits[8] === 0);

    return {
      valid: isValid,
      message: isValid ? '' : 'Ongeldig BSN nummer',
    };
  }, []);

  const validateEmail = useCallback((email?: string): ValidationResult => {
    if (!email) {
      return { valid: true, message: '' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    return {
      valid: isValid,
      message: isValid ? '' : 'Ongeldig email adres',
    };
  }, []);

  const validatePhone = useCallback((phone?: string): ValidationResult => {
    if (!phone) {
      return { valid: true, message: '' };
    }

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      return {
        valid: false,
        message: 'Telefoonnummer moet minimaal 10 cijfers bevatten',
      };
    }

    const phoneRegex = /^(\+31|0031|0)[1-9]\d{8}$/;
    const isValid = phoneRegex.test(phone.replace(/\s/g, ''));

    return {
      valid: isValid,
      message: isValid ? '' : 'Ongeldig Nederlands telefoonnummer',
    };
  }, []);

  const validateRequired = useCallback(
    (value: unknown, fieldName: string): ValidationResult => {
      const isValid = Boolean(value && value.toString().trim().length > 0);

      return {
        valid: isValid,
        message: isValid ? '' : `${fieldName} is verplicht`,
      };
    },
    []
  );

  const validateDate = useCallback((date: string, fieldName: string) => {
    if (!date) {
      return { valid: true, message: '' };
    }

    const dateObj = new Date(date);
    const isValid = !isNaN(dateObj.getTime());

    return {
      valid: isValid,
      message: isValid ? '' : `${fieldName} moet een geldige datum zijn`,
    };
  }, []);

  const validateAge = useCallback(
    (birthDate: string, minAge = 0, maxAge = 150) => {
      if (!birthDate) {
        return { valid: true, message: '' };
      }

      const today = new Date();
      const birth = new Date(birthDate);

      if (birth > today) {
        return {
          valid: false,
          message: 'Geboortedatum kan niet in de toekomst liggen',
        };
      }

      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }

      if (age < minAge || age > maxAge) {
        return {
          valid: false,
          message: `Leeftijd moet tussen ${minAge} en ${maxAge} jaar zijn`,
        };
      }

      return { valid: true, message: '' };
    },
    []
  );

  const validateResidentForm = useCallback(
    (formData: Partial<ResidentForm>) => {
      const errors: Record<string, string> = {};

      const firstNameValidation = validateRequired(
        formData.firstName,
        'Voornaam'
      );
      if (!firstNameValidation.valid) {
        errors.firstName = firstNameValidation.message || 'Invalid first name';
      }

      const lastNameValidation = validateRequired(
        formData.lastName,
        'Achternaam'
      );
      if (!lastNameValidation.valid) {
        errors.lastName = lastNameValidation.message || 'Invalid last name';
      }

      if (formData.birthDate) {
        const birthDateValidation = validateDate(
          formData.birthDate,
          'Geboortedatum'
        );
        if (!birthDateValidation.valid) {
          errors.birthDate =
            birthDateValidation.message || 'Invalid birth date';
        } else {
          const ageValidation = validateAge(formData.birthDate);
          if (!ageValidation.valid) {
            errors.birthDate = ageValidation.message || 'Invalid age';
          }
        }
      }

      if (formData.email) {
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.valid) {
          errors.email = emailValidation.message || 'Invalid email';
        }
      }

      if (formData.phone) {
        const phoneValidation = validatePhone(formData.phone);
        if (!phoneValidation.valid) {
          errors.phone = phoneValidation.message || 'Invalid phone';
        }
      }

      if (formData.bsn) {
        const bsnValidation = validateBSN(formData.bsn);
        if (!bsnValidation.valid) {
          errors.bsn = bsnValidation.message || 'Invalid BSN';
        }
      }

      if (formData.emergencyContact) {
        if (formData.emergencyContact.phone) {
          const emergencyPhoneValidation = validatePhone(
            formData.emergencyContact.phone
          );
          if (!emergencyPhoneValidation.valid) {
            errors['emergencyContact.phone'] =
              emergencyPhoneValidation.message ||
              'Invalid emergency contact phone';
          }
        }
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [
      validateRequired,
      validateDate,
      validateAge,
      validateEmail,
      validatePhone,
      validateBSN,
    ]
  );

  const validateLeaveRequest = useCallback(
    (formData: Partial<LeaveRequest>) => {
      const errors: Record<string, string> = {};

      const residentValidation = validateRequired(
        formData.residentId,
        'Bewoner'
      );
      if (!residentValidation.valid) {
        errors.residentId = residentValidation.message || 'Invalid resident';
      }

      const startDateValidation = validateRequired(
        formData.startDate,
        'Startdatum'
      );
      if (!startDateValidation.valid) {
        errors.startDate = startDateValidation.message || 'Invalid start date';
      }

      const endDateValidation = validateRequired(formData.endDate, 'Einddatum');
      if (!endDateValidation.valid) {
        errors.endDate = endDateValidation.message || 'Invalid end date';
      }

      if (formData.startDate && formData.endDate) {
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);

        if (endDate <= startDate) {
          errors.endDate = 'Einddatum moet na startdatum liggen';
        }
      }

      const reasonValidation = validateRequired(formData.reason, 'Reden');
      if (!reasonValidation.valid) {
        errors.reason = reasonValidation.message || 'Invalid reason';
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [validateRequired]
  );

  return {
    validateBSN,
    validateEmail,
    validatePhone,
    validateRequired,
    validateDate,
    validateAge,
    validateResidentForm,
    validateLeaveRequest,
  };
};
