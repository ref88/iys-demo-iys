import { useReducer, useCallback } from 'react';
import { Resident, UseResidentsReturn } from '@/types';
import { updateResidentWithLabels } from '@/utils/residentUtils';

interface ResidentsAction {
  type:
    | 'SET_RESIDENTS'
    | 'ADD_RESIDENT'
    | 'UPDATE_RESIDENT'
    | 'DELETE_RESIDENT'
    | 'ARCHIVE_RESIDENT'
    | 'UPDATE_LABELS';
  payload?:
    | Resident[]
    | Resident
    | string
    | { id: string; archivedDate: string };
}

const residentsReducer = (
  state: Resident[],
  action: ResidentsAction
): Resident[] => {
  switch (action.type) {
    case 'SET_RESIDENTS':
      return action.payload as Resident[];

    case 'ADD_RESIDENT': {
      const newResident = updateResidentWithLabels(action.payload as Resident);
      return [...state, newResident];
    }

    case 'UPDATE_RESIDENT': {
      const updatedResident = updateResidentWithLabels(
        action.payload as Resident
      );
      return state.map((resident) =>
        resident.id === (action.payload as Resident).id
          ? updatedResident
          : resident
      );
    }

    case 'DELETE_RESIDENT':
      return state.filter(
        (resident) => resident.id !== (action.payload as string)
      );

    case 'ARCHIVE_RESIDENT':
      return state.map((resident) =>
        resident.id ===
        (action.payload as { id: string; archivedDate: string }).id
          ? {
              ...resident,
              archived: true,
              archivedDate: (
                action.payload as { id: string; archivedDate: string }
              ).archivedDate,
            }
          : resident
      );

    case 'UPDATE_LABELS':
      return state.map((resident) => updateResidentWithLabels(resident));

    default:
      return state;
  }
};

const initialResidents: Resident[] = [
  {
    id: 'r1',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    name: 'Ahmed Hassan',
    birthDate: '1985-03-15',
    gender: 'M',
    nationality: 'Syrisch',
    roomNumber: '101',
    labels: ['l1', 'l2'],
    registrationDate: '2024-01-15T10:00:00Z',
    phone: '+31 6 12345678',
    email: 'ahmed.hassan@example.com',
    emergencyContact: {
      firstName: 'Fatima',
      lastName: 'Hassan',
      gender: 'V',
      relationship: 'Echtgenote',
      phone: '+31 6 87654321',
    },
    bsn: '123456789',
    notes: 'Heeft hulp nodig met Nederlandse documenten',
    type: 'human',
    archived: false,
  },
];

export const useResidents = (): UseResidentsReturn => {
  const [residents, dispatch] = useReducer(residentsReducer, initialResidents);

  const addResident = useCallback((residentData: Partial<Resident>) => {
    const newResident: Resident = {
      id: `r${Date.now()}`,
      firstName: '',
      lastName: '',
      labels: [],
      registrationDate: new Date().toISOString(),
      emergencyContact: {
        firstName: '',
        lastName: '',
        gender: '',
        relationship: '',
        phone: '',
      },
      type: 'human',
      archived: false,
      ...residentData,
    };
    dispatch({ type: 'ADD_RESIDENT', payload: newResident });
  }, []);

  const updateResident = useCallback((residentData: Resident) => {
    dispatch({ type: 'UPDATE_RESIDENT', payload: residentData });
  }, []);

  const deleteResident = useCallback((residentId: string) => {
    dispatch({ type: 'DELETE_RESIDENT', payload: residentId });
  }, []);

  const archiveResident = useCallback((residentId: string) => {
    dispatch({
      type: 'ARCHIVE_RESIDENT',
      payload: { id: residentId, archivedDate: new Date().toISOString() },
    });
  }, []);

  const updateLabels = useCallback(() => {
    dispatch({ type: 'UPDATE_LABELS' });
  }, []);

  const getActiveResidents = useCallback(() => {
    return residents.filter((r) => !r.archived);
  }, [residents]);

  const getArchivedResidents = useCallback(() => {
    return residents.filter((r) => r.archived);
  }, [residents]);

  const getResidentById = useCallback(
    (id: string) => {
      return residents.find((r) => r.id === id);
    },
    [residents]
  );

  const getResidentsByType = useCallback(
    (type: Resident['type']) => {
      return residents.filter((r) => r.type === type && !r.archived);
    },
    [residents]
  );

  const getResidentsByLabel = useCallback(
    (label: string) => {
      return residents.filter((r) => r.labels?.includes(label) && !r.archived);
    },
    [residents]
  );

  return {
    residents,
    addResident,
    updateResident,
    deleteResident,
    archiveResident,
    updateLabels,
    getActiveResidents,
    getArchivedResidents,
    getResidentById,
    getResidentsByType,
    getResidentsByLabel,
  };
};
