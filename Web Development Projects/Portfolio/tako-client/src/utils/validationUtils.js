// Validation utilities for forms
import { calculateAge } from './dateUtils.js';

export const ValidationRules = {
  // Basic field validations
  required: (value, fieldName) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is verplicht`;
    }
    return null;
  },

  email: (value) => {
    if (!value) {
      return null;
    } // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Voer een geldig email adres in';
    }
    return null;
  },

  phone: (value) => {
    if (!value) {
      return null;
    } // Will be checked by required if needed
    const phoneRegex = /^[+]?[0-9\s-()]{8,}$/;
    if (!phoneRegex.test(value)) {
      return 'Voer een geldig telefoonnummer in (minimaal 8 cijfers)';
    }
    return null;
  },

  vNumber: (value) => {
    if (!value) {
      return null;
    }
    const vNumberRegex = /^[0-9]{7,}$/;
    if (!vNumberRegex.test(value.replace(/\s/g, ''))) {
      return 'V-nummer moet minimaal 7 cijfers bevatten';
    }
    return null;
  },

  bsn: (value) => {
    if (!value) {
      return null;
    }
    const bsnRegex = /^[0-9]{8,9}$/;
    if (!bsnRegex.test(value.replace(/\s/g, ''))) {
      return 'BSN moet 8 of 9 cijfers bevatten';
    }
    return null;
  },

  birthDate: (value) => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    const today = new Date();
    const hundredYearsAgo = new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate()
    );

    if (date > today) {
      return 'Geboortedatum kan niet in de toekomst liggen';
    }
    if (date < hundredYearsAgo) {
      return 'Geboortedatum kan niet meer dan 100 jaar geleden zijn';
    }
    return null;
  },

  futureDate: (value, fieldName) => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return `${fieldName} moet in de toekomst liggen`;
    }
    return null;
  },

  minAge: (birthDate, minAge) => {
    if (!birthDate) {
      return null;
    }
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    let actualAge = age;
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      actualAge--;
    }

    if (actualAge < minAge) {
      return `Minimale leeftijd is ${minAge} jaar`;
    }
    return null;
  },

  maxLength: (value, maxLength, fieldName) => {
    if (!value) {
      return null;
    }
    if (value.length > maxLength) {
      return `${fieldName} mag maximaal ${maxLength} tekens bevatten`;
    }
    return null;
  },

  minLength: (value, minLength, fieldName) => {
    if (!value) {
      return null;
    }
    if (value.length < minLength) {
      return `${fieldName} moet minimaal ${minLength} tekens bevatten`;
    }
    return null;
  },
};

export class FormValidator {
  constructor() {
    this.rules = [];
    this.errors = {};
  }

  addRule(field, rule, ...args) {
    this.rules.push({ field, rule, args });
    return this;
  }

  required(field, fieldName) {
    return this.addRule(field, 'required', fieldName || field);
  }

  email(field) {
    return this.addRule(field, 'email');
  }

  phone(field) {
    return this.addRule(field, 'phone');
  }

  vNumber(field) {
    return this.addRule(field, 'vNumber');
  }

  bsn(field) {
    return this.addRule(field, 'bsn');
  }

  birthDate(field) {
    return this.addRule(field, 'birthDate');
  }

  futureDate(field, fieldName) {
    return this.addRule(field, 'futureDate', fieldName || field);
  }

  minAge(field, minAge) {
    return this.addRule(field, 'minAge', minAge);
  }

  maxLength(field, maxLength, fieldName) {
    return this.addRule(field, 'maxLength', maxLength, fieldName || field);
  }

  minLength(field, minLength, fieldName) {
    return this.addRule(field, 'minLength', minLength, fieldName || field);
  }

  custom(field, validationFn) {
    return this.addRule(field, 'custom', validationFn);
  }

  validate(formData) {
    this.errors = {};

    this.rules.forEach(({ field, rule, args }) => {
      const value = this.getNestedValue(formData, field);
      let error = null;

      if (rule === 'custom') {
        error = args[0](value, formData);
      } else if (ValidationRules[rule]) {
        error = ValidationRules[rule](value, ...args);
      }

      if (error) {
        this.setNestedError(field, error);
      }
    });

    return this.errors;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  setNestedError(path, error) {
    const keys = path.split('.');
    let current = this.errors;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = error;
  }

  isValid() {
    return Object.keys(this.errors).length === 0;
  }

  getErrors() {
    return this.errors;
  }

  hasError(field) {
    return !!this.getNestedValue(this.errors, field);
  }

  getError(field) {
    return this.getNestedValue(this.errors, field);
  }
}

// Helper function to validate specific scenarios
export const validateResidentForm = (
  formData,
  locationType,
  existingResidents = []
) => {
  const validator = new FormValidator();

  // Common validations
  validator
    .required('name', 'Naam')
    .required('room', 'Kamer')
    .required('caseworker', 'Begeleider')
    .maxLength('name', 100, 'Naam')
    .maxLength('room', 20, 'Kamer')
    .maxLength('notes', 1000, 'Notities');

  // Type-specific validations
  if (formData.type === 'human') {
    validator
      .required('nationality', 'Nationaliteit')
      .required('birthDate', 'Geboortedatum')
      .required('phone', 'Telefoonnummer')
      .birthDate('birthDate')
      .phone('phone')
      .email('email')
      .maxLength('nationality', 50, 'Nationaliteit')
      .maxLength('language', 50, 'Taal');

    // Number validation based on location type
    if (locationType === 'CNO') {
      validator.required('nummerWaarde', 'V-nummer').vNumber('nummerWaarde');
    } else if (locationType === 'OEKRAINE') {
      if (formData.bsnStatus !== 'aangevraagd') {
        validator.required('nummerWaarde', 'BSN').bsn('nummerWaarde');
      }
    }

    // Minor validation
    if (formData.birthDate) {
      const age = calculateAge(formData.birthDate);
      if (age < 18 && !formData.guardianName) {
        validator.custom(
          'guardianName',
          () => 'Voogd is verplicht voor minderjarigen'
        );
      }
    }
  } else {
    // Pet validations
    validator.required('breed', 'Ras').maxLength('breed', 50, 'Ras');

    // Pet validation - dieren als bewoners hoeven geen aparte eigenaar validatie

    if (formData.nextVaccinationDate) {
      validator.futureDate('nextVaccinationDate', 'Volgende vaccinatie');
    }
  }

  // Work status validations
  if (formData.workStatus && formData.workStatus.length > 0) {
    if (formData.workStatus.includes('zzp') && !formData.zzpDetails) {
      validator.custom('zzpDetails', () => 'ZZP details zijn verplicht');
    }
    if (formData.workStatus.includes('loondienst') && !formData.employerName) {
      validator.custom('employerName', () => 'Werkgever naam is verplicht');
    }
    if (formData.workStatus.includes('leefgeld') && !formData.leefgeldAmount) {
      validator.custom('leefgeldAmount', () => 'Leefgeld bedrag is verplicht');
    }
  }

  // Duplicate name check
  if (existingResidents.length > 0) {
    const duplicate = existingResidents.find(
      (r) =>
        r.name.toLowerCase() === formData.name.toLowerCase() &&
        r.id !== formData.id
    );
    if (duplicate) {
      validator.custom(
        'name',
        () => 'Deze naam wordt al gebruikt door een andere bewoner'
      );
    }
  }

  // Duplicate number check
  if (formData.nummerWaarde) {
    const duplicate = existingResidents.find(
      (r) =>
        (r.vNumber === formData.nummerWaarde ||
          r.bsnNumber === formData.nummerWaarde) &&
        r.id !== formData.id
    );
    if (duplicate) {
      validator.custom(
        'nummerWaarde',
        () => 'Dit nummer wordt al gebruikt door een andere bewoner'
      );
    }
  }

  return validator.validate(formData);
};

// Error message formatting
export const formatErrorMessage = (error, fieldName) => {
  if (!error) {
    return null;
  }

  // If error is already formatted, return as is
  if (typeof error === 'string') {
    return error;
  }

  // If error is an object with a message property
  if (error.message) {
    return error.message;
  }

  // Default fallback
  return `${fieldName} is ongeldig`;
};
