import { Resident } from '../types/index';

const calculateAge = (birthDate?: string): number | null => {
  if (!birthDate) {
    return null;
  }
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const getAutomaticLabels = (
  birthDate?: string,
  registrationDate: string | null = null,
  type: Resident['type'] = 'human',
  isVaccinated = false,
  nextVaccinationDate: string | null = null,
  isChipped = false,
  isSterilized = false,
  bsn: string | null = null
): string[] => {
  const automaticLabels = [];

  if (type === 'cat') {
    automaticLabels.push('l10');
  } else if (type === 'dog') {
    automaticLabels.push('l11');
  }

  if (type !== 'human') {
    if (isVaccinated) {
      automaticLabels.push('l12');
    } else if (nextVaccinationDate) {
      const nextVacDate = new Date(nextVaccinationDate);
      const today = new Date();
      if (
        nextVacDate <= today ||
        nextVacDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000
      ) {
        automaticLabels.push('l13');
      }
    }

    if (isChipped) {
      automaticLabels.push('l14');
    }

    if (isSterilized) {
      automaticLabels.push('l15');
    }
  }

  if (type === 'human') {
    const age = calculateAge(birthDate);
    if (age !== null) {
      // Age-based automatic labeling
      if (age >= 0 && age <= 1) {
        automaticLabels.push('27'); // Baby (0-1 jaar)
      }
      if (age >= 1 && age <= 4) {
        automaticLabels.push('28'); // Peuter (1-4 jaar)
      }
      if (age < 18) {
        automaticLabels.push('29'); // Minderjarig (<18 jaar)
      }
      if (age >= 65) {
        automaticLabels.push('30'); // Senior (65+ jaar)
      }

      // Legacy support for existing labels
      if (age < 2) {
        automaticLabels.push('l8');
      }
      if (age < 18) {
        automaticLabels.push('l3');
      }
      if (age >= 65) {
        automaticLabels.push('l7');
      }
    }

    // BSN logic - add 'BSN ontbreekt' label if BSN is missing
    if (!bsn || bsn.trim() === '') {
      automaticLabels.push('26'); // BSN ontbreekt label ID
    }
  }

  if (registrationDate) {
    const regDate = new Date(registrationDate);
    const oneMonthLater = new Date(regDate);
    oneMonthLater.setMonth(regDate.getMonth() + 1);
    const today = new Date();

    if (today <= oneMonthLater) {
      automaticLabels.push('l4');
    }
  }

  return automaticLabels;
};

const updateResidentWithLabels = (resident: Resident): Resident => {
  const allLabels = [...(resident.labels || [])];
  const automaticLabels = getAutomaticLabels(
    resident.birthDate,
    resident.registrationDate,
    resident.type || 'human',
    resident.isVaccinated || false,
    resident.nextVaccinationDate,
    resident.isChipped || false,
    resident.isSterilized || false,
    resident.bsn || null
  );

  // Handle BSN labeling logic specifically
  const bsnMissingLabelId = '26';
  const hasBSN = resident.bsn && resident.bsn.trim() !== '';

  if (hasBSN) {
    // Remove BSN missing label if BSN is present
    const index = allLabels.indexOf(bsnMissingLabelId);
    if (index > -1) {
      allLabels.splice(index, 1);
    }
  } else {
    // Add BSN missing label if BSN is not present
    if (!allLabels.includes(bsnMissingLabelId)) {
      allLabels.push(bsnMissingLabelId);
    }
  }

  // Handle age-based labeling logic specifically
  const ageLabelIds = ['27', '28', '29', '30']; // Baby, Peuter, Minderjarig, Senior
  const age = calculateAge(resident.birthDate);

  if (resident.type === 'human' && age !== null) {
    // Remove all age-based labels first
    ageLabelIds.forEach((labelId) => {
      const index = allLabels.indexOf(labelId);
      if (index > -1) {
        allLabels.splice(index, 1);
      }
    });

    // Add appropriate age-based labels
    if (age >= 0 && age <= 1) {
      allLabels.push('27'); // Baby
    }
    if (age >= 1 && age <= 4) {
      allLabels.push('28'); // Peuter
    }
    if (age < 18) {
      allLabels.push('29'); // Minderjarig
    }
    if (age >= 65) {
      allLabels.push('30'); // Senior
    }
  }

  // Add other automatic labels
  automaticLabels.forEach((label) => {
    if (!allLabels.includes(label)) {
      allLabels.push(label);
    }
  });

  return {
    ...resident,
    labels: allLabels,
  };
};

const filterResidents = (
  residents: Resident[],
  searchTerm: string,
  selectedLabels: string[]
): Resident[] => {
  return residents.filter((resident) => {
    const matchesSearch =
      !searchTerm ||
      resident.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.nationality?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLabels =
      selectedLabels.length === 0 ||
      selectedLabels.every((label) => resident.labels?.includes(label));

    return matchesSearch && matchesLabels;
  });
};

const sortResidents = (
  residents: Resident[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): Resident[] => {
  return [...residents].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'name':
        aValue = a.name || `${a.firstName} ${a.lastName}`;
        bValue = b.name || `${b.firstName} ${b.lastName}`;
        break;
      case 'age':
        aValue = calculateAge(a.birthDate) || 0;
        bValue = calculateAge(b.birthDate) || 0;
        break;
      case 'registrationDate':
        aValue = new Date(a.registrationDate || 0);
        bValue = new Date(b.registrationDate || 0);
        break;
      case 'roomNumber':
        aValue = a.roomNumber || '';
        bValue = b.roomNumber || '';
        break;
      case 'nationality':
        aValue = a.nationality || '';
        bValue = b.nationality || '';
        break;
      default:
        aValue = a.name || `${a.firstName} ${a.lastName}`;
        bValue = b.name || `${b.firstName} ${b.lastName}`;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

const generateResidentId = (): string => {
  return `r${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const formatResidentName = (resident: Resident): string => {
  if (resident.name) {
    return resident.name;
  }
  if (resident.firstName && resident.lastName) {
    return `${resident.firstName} ${resident.lastName}`;
  }
  return resident.firstName || resident.lastName || 'Onbekend';
};

const getResidentAge = (resident: Resident): number | null => {
  return calculateAge(resident.birthDate);
};

const getResidentTypeLabel = (type: Resident['type']): string => {
  switch (type) {
    case 'human':
      return 'Mens';
    case 'cat':
      return 'Kat';
    case 'dog':
      return 'Hond';
    default:
      return 'Onbekend';
  }
};

export {
  calculateAge,
  getAutomaticLabels,
  updateResidentWithLabels,
  filterResidents,
  sortResidents,
  generateResidentId,
  formatResidentName,
  getResidentAge,
  getResidentTypeLabel,
};
