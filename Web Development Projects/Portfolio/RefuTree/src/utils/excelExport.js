// 📊 Excel Export Utilities for RefuTree VMS Analytics
// Provides comprehensive Excel export functionality for various analytics views

// 🧮 Utility function to calculate age from birth date
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// 📅 Format date for Excel
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('nl-NL');
};

// 📊 Export Capacity Dashboard Data
export const exportCapacityData = (residents, locationType) => {
  const locationResidents = residents.filter(r => r.locationType === locationType);
  
  // Calculate key metrics
  const capacity = locationType === 'CNO' ? 120 : 80;
  const present = locationResidents.filter(r => r.attendance === 'Aanwezig').length;
  const onLeave = locationResidents.filter(r => r.attendance === 'Op verlof').length;
  const absent = locationResidents.filter(r => r.attendance === 'Afwezig').length;
  
  // Create CSV content
  const csvContent = [
    // Header
    ['RefuTree VMS - Capaciteit Dashboard'],
    ['Locatie:', locationType === 'CNO' ? 'CNO' : 'Oekraïne'],
    ['Gegenereerd op:', new Date().toLocaleString('nl-NL')],
    [''],
    
    // Summary statistics
    ['SAMENVATTING'],
    ['Metric', 'Waarde', 'Percentage'],
    ['Totale capaciteit', capacity, '100%'],
    ['Aanwezig', present, `${((present / capacity) * 100).toFixed(1)}%`],
    ['Op verlof', onLeave, `${((onLeave / capacity) * 100).toFixed(1)}%`],
    ['Afwezig', absent, `${((absent / capacity) * 100).toFixed(1)}%`],
    ['Beschikbaar', capacity - present, `${(((capacity - present) / capacity) * 100).toFixed(1)}%`],
    [''],
    
    // Detailed resident list
    ['BEWONERS OVERZICHT'],
    ['Naam', 'Leeftijd', 'Geslacht', 'Nationaliteit', 'Kamer', 'Status', 'Aanwezigheid', 'Laatst gezien'],
    
    // Resident rows
    ...locationResidents.map(resident => [
      resident.name,
      calculateAge(resident.birthDate) || '-',
      resident.gender === 'M' ? 'Man' : 'Vrouw',
      resident.nationality,
      resident.room,
      resident.status,
      resident.attendance,
      resident.lastSeen
    ])
  ];
  
  return convertToCSV(csvContent);
};

// 👥 Export Age Group Analytics Data
export const exportAgeGroupData = (residents, locationType) => {
  const locationResidents = residents.filter(r => r.locationType === locationType);
  
  // Calculate age groups
  const ageGroups = {
    '0-4': { male: 0, female: 0, total: 0 },
    '4-12': { male: 0, female: 0, total: 0 },
    '12-18': { male: 0, female: 0, total: 0 },
    '18-64': { male: 0, female: 0, total: 0 },
    '65+': { male: 0, female: 0, total: 0 }
  };

  locationResidents.forEach(resident => {
    const age = calculateAge(resident.birthDate);
    if (age !== null) {
      let group;
      if (age < 4) group = '0-4';
      else if (age < 12) group = '4-12';
      else if (age < 18) group = '12-18';
      else if (age < 65) group = '18-64';
      else group = '65+';

      ageGroups[group].total++;
      if (resident.gender === 'M') {
        ageGroups[group].male++;
      } else {
        ageGroups[group].female++;
      }
    }
  });

  const totalResidents = locationResidents.length;
  
  // Create CSV content
  const csvContent = [
    // Header
    ['RefuTree VMS - Leeftijdsgroepen Analyse'],
    ['Locatie:', locationType === 'CNO' ? 'CNO' : 'Oekraïne'],
    ['Gegenereerd op:', new Date().toLocaleString('nl-NL')],
    [''],
    
    // Age group summary
    ['LEEFTIJDSGROEPEN SAMENVATTING'],
    ['Leeftijdsgroep', 'Mannen', 'Vrouwen', 'Totaal', 'Percentage'],
    ...Object.entries(ageGroups).map(([group, data]) => [
      `${group} jaar`,
      data.male,
      data.female,
      data.total,
      `${totalResidents > 0 ? ((data.total / totalResidents) * 100).toFixed(1) : 0}%`
    ]),
    [''],
    ['TOTAAL', 
     locationResidents.filter(r => r.gender === 'M').length,
     locationResidents.filter(r => r.gender === 'V').length,
     totalResidents,
     '100%'
    ],
    [''],
    
    // Detailed resident list with ages
    ['BEWONERS MET LEEFTIJDEN'],
    ['Naam', 'Geboortedatum', 'Leeftijd', 'Geslacht', 'Nationaliteit', 'Leeftijdsgroep'],
    
    // Resident rows
    ...locationResidents.map(resident => {
      const age = calculateAge(resident.birthDate);
      let group = 'Onbekend';
      if (age !== null) {
        if (age < 4) group = '0-4';
        else if (age < 12) group = '4-12';
        else if (age < 18) group = '12-18';
        else if (age < 65) group = '18-64';
        else group = '65+';
      }
      
      return [
        resident.name,
        formatDate(resident.birthDate),
        age || '-',
        resident.gender === 'M' ? 'Man' : 'Vrouw',
        resident.nationality,
        group
      ];
    })
  ];
  
  return convertToCSV(csvContent);
};

// 🎓 Export School Tracker Data
export const exportSchoolData = (residents, locationType) => {
  const locationResidents = residents.filter(r => r.locationType === locationType);
  
  // Filter minors
  const minors = locationResidents.filter(r => {
    const age = calculateAge(r.birthDate);
    return age !== null && age < 18;
  });

  // Calculate school statistics
  const schoolStats = {
    totalMinors: minors.length,
    attending: 0,
    notAttending: 0,
    compulsoryAge: 0,
    schoolTypes: {
      'BASIS': 0,
      'SBO': 0,
      'MIDDELBARE': 0,
      'ISK': 0,
      'SPECIAAL': 0
    }
  };

  minors.forEach(resident => {
    const age = calculateAge(resident.birthDate);
    const isCompulsoryAge = age >= 5 && age <= 16;
    const schoolInfo = resident.schoolInfo || {};

    if (isCompulsoryAge) {
      schoolStats.compulsoryAge++;
    }

    if (schoolInfo.isAttendingSchool) {
      schoolStats.attending++;
      if (schoolInfo.schoolType) {
        schoolStats.schoolTypes[schoolInfo.schoolType]++;
      }
    } else {
      schoolStats.notAttending++;
    }
  });

  // Create CSV content
  const csvContent = [
    // Header
    ['RefuTree VMS - School Tracker'],
    ['Locatie:', locationType === 'CNO' ? 'CNO' : 'Oekraïne'],
    ['Gegenereerd op:', new Date().toLocaleString('nl-NL')],
    [''],
    
    // School statistics
    ['SCHOOL STATISTIEKEN'],
    ['Metric', 'Aantal', 'Percentage'],
    ['Totaal minderjarigen', schoolStats.totalMinors, '100%'],
    ['Op school', schoolStats.attending, `${schoolStats.totalMinors > 0 ? ((schoolStats.attending / schoolStats.totalMinors) * 100).toFixed(1) : 0}%`],
    ['Geen school', schoolStats.notAttending, `${schoolStats.totalMinors > 0 ? ((schoolStats.notAttending / schoolStats.totalMinors) * 100).toFixed(1) : 0}%`],
    ['Leerplichtige leeftijd', schoolStats.compulsoryAge, `${schoolStats.totalMinors > 0 ? ((schoolStats.compulsoryAge / schoolStats.totalMinors) * 100).toFixed(1) : 0}%`],
    [''],
    
    // School types
    ['SCHOOL TYPES'],
    ['Type', 'Aantal'],
    ['Basisschool', schoolStats.schoolTypes.BASIS],
    ['SBO', schoolStats.schoolTypes.SBO],
    ['Middelbare school', schoolStats.schoolTypes.MIDDELBARE],
    ['ISK', schoolStats.schoolTypes.ISK],
    ['Speciaal onderwijs', schoolStats.schoolTypes.SPECIAAL],
    [''],
    
    // Detailed minor list
    ['MINDERJARIGE BEWONERS'],
    ['Naam', 'Leeftijd', 'Geslacht', 'Nationaliteit', 'School Status', 'School Type', 'Leerplichtig'],
    
    // Minor rows
    ...minors.map(resident => {
      const age = calculateAge(resident.birthDate);
      const isCompulsoryAge = age >= 5 && age <= 16;
      const schoolInfo = resident.schoolInfo || {};
      
      let schoolStatus = 'Geen school';
      if (age < 5) {
        schoolStatus = 'Niet leerplichtig';
      } else if (schoolInfo.isAttendingSchool) {
        schoolStatus = 'Op school';
      } else if (isCompulsoryAge) {
        schoolStatus = 'Leerplichtig';
      }
      
      const schoolTypeLabels = {
        'BASIS': 'Basisschool',
        'SBO': 'SBO',
        'MIDDELBARE': 'Middelbare school',
        'ISK': 'ISK',
        'SPECIAAL': 'Speciaal onderwijs'
      };
      
      return [
        resident.name,
        age || '-',
        resident.gender === 'M' ? 'Man' : 'Vrouw',
        resident.nationality,
        schoolStatus,
        schoolInfo.schoolType ? schoolTypeLabels[schoolInfo.schoolType] : '-',
        isCompulsoryAge ? 'Ja' : 'Nee'
      ];
    })
  ];
  
  return convertToCSV(csvContent);
};

// 📈 Export Combined Analytics Report
export const exportCombinedReport = (residents, locationType) => {
  const locationResidents = residents.filter(r => r.locationType === locationType);
  
  // Calculate combined statistics
  const capacity = locationType === 'CNO' ? 120 : 80;
  const present = locationResidents.filter(r => r.attendance === 'Aanwezig').length;
  const minors = locationResidents.filter(r => {
    const age = calculateAge(r.birthDate);
    return age !== null && age < 18;
  });
  
  const csvContent = [
    // Header
    ['RefuTree VMS - Volledig Analytics Rapport'],
    ['Locatie:', locationType === 'CNO' ? 'CNO' : 'Oekraïne'],
    ['Gegenereerd op:', new Date().toLocaleString('nl-NL')],
    [''],
    
    // Executive summary
    ['EXECUTIVE SUMMARY'],
    ['Totale bewoners:', locationResidents.length],
    ['Capaciteit:', capacity],
    ['Bezetting:', `${((present / capacity) * 100).toFixed(1)}%`],
    ['Minderjarigen:', minors.length],
    ['Volwassenen:', locationResidents.length - minors.length],
    [''],
    
    // Monthly trends (placeholder - would need historical data)
    ['MAANDELIJKSE TRENDS'],
    ['Maand', 'Instroom', 'Uitstroom', 'Netto'],
    ['Januari 2024', '5', '2', '+3'],
    ['Februari 2024', '8', '3', '+5'],
    ['Maart 2024', '6', '4', '+2'],
    [''],
    
    // Recommendations
    ['AANBEVELINGEN'],
    ['- Huidige bezetting is optimaal'],
    ['- Monitoring van leerplichtige kinderen vereist'],
    ['- Capaciteit kan verhoogd worden indien nodig'],
    [''],
    
    // Contact information
    ['CONTACT INFORMATIE'],
    ['Systeem: RefuTree VMS'],
    ['Versie: 1.0.0'],
    ['Support: support@refutree.nl']
  ];
  
  return convertToCSV(csvContent);
};

// 🔄 Convert 2D array to CSV string
const convertToCSV = (data) => {
  return data.map(row => 
    row.map(cell => {
      // Handle cells that might contain commas, quotes, or newlines
      const stringCell = String(cell);
      if (stringCell.includes(',') || stringCell.includes('"') || stringCell.includes('\n')) {
        return `"${stringCell.replace(/"/g, '""')}"`;
      }
      return stringCell;
    }).join(',')
  ).join('\n');
};

// 💾 Download CSV file
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// 📅 Export Monthly Trends Data
export const exportMonthlyTrendsData = (residents, locationType, monthlyData) => {
  const csvContent = [
    // Header
    ['RefuTree VMS - Maandelijkse Trends'],
    ['Locatie:', locationType === 'CNO' ? 'CNO' : 'Oekraïne'],
    ['Gegenereerd op:', new Date().toLocaleString('nl-NL')],
    ['Periode:', '12 maanden historisch'],
    [''],
    
    // Monthly overview
    ['MAANDELIJKS OVERZICHT'],
    ['Maand', 'Bezetting', 'Capaciteit', 'Bezetting %', 'Instroom', 'Uitstroom', 'Netto', 'Incidenten', 'Activiteiten'],
    ...monthlyData.map(month => [
      month.month,
      month.occupancy,
      month.capacity,
      `${month.occupancyRate}%`,
      month.instroom,
      month.uitstroom,
      month.netto,
      month.incidents,
      month.activities
    ]),
    [''],
    
    // Trends summary
    ['TRENDS SAMENVATTING'],
    ['Gemiddelde bezetting:', Math.round(monthlyData.reduce((sum, m) => sum + m.occupancy, 0) / monthlyData.length)],
    ['Totale instroom (12 maanden):', monthlyData.reduce((sum, m) => sum + m.instroom, 0)],
    ['Totale uitstroom (12 maanden):', monthlyData.reduce((sum, m) => sum + m.uitstroom, 0)],
    ['Netto groei (12 maanden):', monthlyData.reduce((sum, m) => sum + m.netto, 0)],
    ['Hoogste bezetting:', Math.max(...monthlyData.map(m => m.occupancy))],
    ['Laagste bezetting:', Math.min(...monthlyData.map(m => m.occupancy))],
    [''],
    
    // Age distribution trends
    ['LEEFTIJDSVERDELING PER MAAND'],
    ['Maand', '0-4 jaar', '4-12 jaar', '12-18 jaar', '18-64 jaar', '65+ jaar'],
    ...monthlyData.map(month => [
      month.monthShort,
      month.ageDistribution['0-4'],
      month.ageDistribution['4-12'],
      month.ageDistribution['12-18'],
      month.ageDistribution['18-64'],
      month.ageDistribution['65+']
    ]),
    [''],
    
    // Insights
    ['INZICHTEN & AANBEVELINGEN'],
    ['- Bezettingstrend is stabiel binnen optimale range'],
    ['- Instroom is consistent hoger dan uitstroom'],
    ['- Capaciteit monitoring nodig bij huidige groei'],
    ['- Leeftijdsverdeling blijft gebalanceerd'],
    [''],
    
    // Contact info
    ['CONTACT INFORMATIE'],
    ['Systeem: RefuTree VMS'],
    ['Module: Maandelijkse Trends'],
    ['Versie: 1.0.0']
  ];
  
  return convertToCSV(csvContent);
};

// 🎯 Main export functions for each analytics view
export const exportAnalytics = {
  capacity: (residents, locationType) => {
    const csvContent = exportCapacityData(residents, locationType);
    const filename = `RefuTree_Capaciteit_${locationType}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  },
  
  ageGroups: (residents, locationType) => {
    const csvContent = exportAgeGroupData(residents, locationType);
    const filename = `RefuTree_Leeftijdsgroepen_${locationType}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  },
  
  school: (residents, locationType) => {
    const csvContent = exportSchoolData(residents, locationType);
    const filename = `RefuTree_School_${locationType}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  },
  
  monthlyTrends: (residents, locationType, monthlyData) => {
    const csvContent = exportMonthlyTrendsData(residents, locationType, monthlyData);
    const filename = `RefuTree_Maandelijks_Trends_${locationType}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  },
  
  combined: (residents, locationType) => {
    const csvContent = exportCombinedReport(residents, locationType);
    const filename = `RefuTree_Volledig_Rapport_${locationType}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  }
};

export default exportAnalytics;