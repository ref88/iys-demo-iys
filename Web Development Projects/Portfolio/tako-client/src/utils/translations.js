/**
 * TAKO VMS Translation System
 * Simple, efficient i18n for Dutch + English
 */

export const translations = {
  nl: {
    // Navigation
    dashboard: 'Dashboard',
    residents: 'Bewoners',
    meldplicht: 'Meldplicht',
    verlof: 'Verlof',
    documents: 'Documenten',
    incidents: 'Incidenten',
    analytics: 'Analytics',
    labels: 'Labels',
    settings: 'Instellingen',
    auditTrail: 'Audit Trail',
    overdracht: 'Overdracht',
    agenda: 'Agenda',

    // Actions
    save: 'Opslaan',
    cancel: 'Annuleren',
    add: 'Toevoegen',
    edit: 'Bewerken',
    delete: 'Verwijderen',
    search: 'Zoeken',
    filter: 'Filter',
    export: 'Exporteren',
    close: 'Sluiten',
    submit: 'Versturen',

    // Status
    active: 'Actief',
    inactive: 'Inactief',
    pending: 'In behandeling',
    completed: 'Voltooid',

    // Common
    name: 'Naam',
    age: 'Leeftijd',
    status: 'Status',
    date: 'Datum',
    time: 'Tijd',
    location: 'Locatie',
    notes: 'Notities',

    // Residents
    addResident: 'Bewoner Toevoegen',
    editResident: 'Bewoner Bewerken',
    deleteResident: 'Bewoner Verwijderen',
    residentDetails: 'Bewoner Details',

    // Meldplicht
    reportingDuty: 'Meldplicht',
    reportingStatus: 'Meldplicht Status',

    // Leave/Verlof
    leaveRequest: 'Verlof Aanvraag',
    leaveBalance: 'Verlof Saldo',
    leaveApproval: 'Verlof Goedkeuring',

    // Common phrases
    required: 'Verplicht',
    optional: 'Optioneel',
    loading: 'Laden...',
    error: 'Fout',
    success: 'Succes',

    // Language
    language: 'Taal',
    dutch: 'Nederlands',
    english: 'Engels',

    // Quick Actions
    quickActions: 'Snelle Acties',
    newResident: 'Nieuwe Bewoner',
    searchResidents: 'Bewoners Zoeken',

    // Dashboard
    overview: 'Overzicht',
    total: 'Totaal',
    present: 'Aanwezig',
    absent: 'Afwezig',

    // Common UI
    welcome: 'Welkom',
    today: 'Vandaag',
    thisWeek: 'Deze Week',
    thisMonth: 'Deze Maand',
  },

  en: {
    // Navigation
    dashboard: 'Dashboard',
    residents: 'Residents',
    meldplicht: 'Reporting Duty',
    verlof: 'Leave',
    documents: 'Documents',
    incidents: 'Incidents',
    analytics: 'Analytics',
    labels: 'Labels',
    settings: 'Settings',
    auditTrail: 'Audit Trail',
    overdracht: 'Handover',
    agenda: 'Schedule',

    // Actions
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    close: 'Close',
    submit: 'Submit',

    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',

    // Common
    name: 'Name',
    age: 'Age',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    notes: 'Notes',

    // Residents
    addResident: 'Add Resident',
    editResident: 'Edit Resident',
    deleteResident: 'Delete Resident',
    residentDetails: 'Resident Details',

    // Meldplicht
    reportingDuty: 'Reporting Duty',
    reportingStatus: 'Reporting Status',

    // Leave/Verlof
    leaveRequest: 'Leave Request',
    leaveBalance: 'Leave Balance',
    leaveApproval: 'Leave Approval',

    // Common phrases
    required: 'Required',
    optional: 'Optional',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    // Language
    language: 'Language',
    dutch: 'Dutch',
    english: 'English',

    // Quick Actions
    quickActions: 'Quick Actions',
    newResident: 'New Resident',
    searchResidents: 'Search Residents',

    // Dashboard
    overview: 'Overview',
    total: 'Total',
    present: 'Present',
    absent: 'Absent',

    // Common UI
    welcome: 'Welcome',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
  },
};

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {string} language - Language code (nl/en)
 * @returns {string} Translated text or fallback
 */
export const getTranslation = (key, language = 'nl') => {
  const translation = translations[language]?.[key];

  // Fallback to English if Dutch translation missing
  if (!translation && language === 'nl') {
    return translations.en[key] || key;
  }

  // Fallback to Dutch if English translation missing
  if (!translation && language === 'en') {
    return translations.nl[key] || key;
  }

  return translation || key;
};

/**
 * Get all available languages
 * @returns {Array} Array of language objects
 */
export const getAvailableLanguages = () => [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export default translations;
