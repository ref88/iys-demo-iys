import { useMemo } from 'react';
import { Resident, AnalyticsData } from '@/types';
import { calculateAge } from '@/utils/residentUtils';

export const useAnalytics = (residents: Resident[]): AnalyticsData => {
  const analytics = useMemo(() => {
    const activeResidents = residents.filter((r) => !r.archived);

    const totalResidents = activeResidents.length;
    const families = new Set(
      activeResidents.filter((r) => r.familyId).map((r) => r.familyId)
    ).size;
    const children = activeResidents.filter(
      (r) => r.familyRole === 'child'
    ).length;
    const individuals = activeResidents.filter((r) => !r.familyId).length;

    const genderDistribution = activeResidents.reduce(
      (acc: Record<string, number>, resident) => {
        const gender = resident.gender || 'Unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      },
      {}
    );

    const nationalityDistribution = activeResidents.reduce(
      (acc: Record<string, number>, resident) => {
        const nationality = resident.nationality || 'Unknown';
        acc[nationality] = (acc[nationality] || 0) + 1;
        return acc;
      },
      {}
    );

    const typeDistribution = activeResidents.reduce(
      (acc: Record<string, number>, resident) => {
        const type = resident.type || 'human';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {}
    );

    const ageGroups = activeResidents.reduce(
      (acc: Record<string, number>, resident) => {
        if (resident.type !== 'human') {
          return acc;
        }

        const age = calculateAge(resident.birthDate);
        if (age === null) {
          return acc;
        }

        let group;
        if (age < 2) {
          group = 'Baby (0-2)';
        } else if (age < 13) {
          group = 'Kind (3-12)';
        } else if (age < 18) {
          group = 'Tiener (13-17)';
        } else if (age < 30) {
          group = 'Jong volwassene (18-29)';
        } else if (age < 50) {
          group = 'Volwassene (30-49)';
        } else if (age < 65) {
          group = 'Middenleeftijd (50-64)';
        } else {
          group = 'Senior (65+)';
        }

        acc[group] = (acc[group] || 0) + 1;
        return acc;
      },
      {}
    );

    const roomOccupancy = activeResidents.reduce(
      (acc: Record<string, number>, resident) => {
        if (resident.roomNumber) {
          acc[resident.roomNumber] = (acc[resident.roomNumber] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    const labelDistribution = activeResidents.reduce(
      (acc: Record<string, number>, resident) => {
        if (resident.labels && Array.isArray(resident.labels)) {
          resident.labels.forEach((label) => {
            acc[label] = (acc[label] || 0) + 1;
          });
        }
        return acc;
      },
      {}
    );

    const registrationTrends = activeResidents.reduce(
      (acc: Record<string, number>, resident) => {
        if (resident.registrationDate) {
          const month = new Date(resident.registrationDate)
            .toISOString()
            .slice(0, 7);
          acc[month] = (acc[month] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    const recentRegistrations = activeResidents.filter((resident) => {
      if (!resident.registrationDate) {
        return false;
      }
      const regDate = new Date(resident.registrationDate);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return regDate >= monthAgo;
    }).length;

    const averageAge =
      activeResidents
        .filter((r) => r.type === 'human' && r.birthDate)
        .reduce((sum, resident) => {
          const age = calculateAge(resident.birthDate);
          return sum + (age || 0);
        }, 0) /
      activeResidents.filter((r) => r.type === 'human' && r.birthDate).length;

    const capacityData = {
      totalCapacity: 150,
      currentOccupancy: totalResidents,
      occupancyRate: (totalResidents / 150) * 100,
      availableSpaces: 150 - totalResidents,
    };

    const emergencyContacts = activeResidents.filter(
      (r) => r.emergencyContact && r.emergencyContact.phone
    ).length;

    const documentsCount = activeResidents.reduce((sum, resident) => {
      return sum + (resident.documents?.length || 0);
    }, 0);

    return {
      overview: {
        totalResidents,
        families,
        children,
        individuals,
        recentRegistrations,
        averageAge: Math.round(averageAge || 0),
        emergencyContacts,
        documentsCount,
      },
      distributions: {
        gender: genderDistribution,
        nationality: nationalityDistribution,
        type: typeDistribution,
        ageGroups,
        labels: labelDistribution,
      },
      capacity: capacityData,
      roomOccupancy,
      registrationTrends,
      trends: {
        monthlyRegistrations: registrationTrends,
        occupancyTrend: [(totalResidents / 150) * 100],
      },
    };
  }, [residents]);

  return analytics;
};
