import React, {
  useEffect,
  useCallback,
  useState,
  lazy,
  Suspense /*, useMemo */,
} from 'react';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import useAuditNotifications from '../../hooks/useAuditNotifications.js';
import { useResidents } from '../../hooks/useResidents.ts';
import { useVMSState } from '../../hooks/useVMSState';
import { useValidation } from '../../hooks/useValidation.ts';
// import { auditHelpers } from '../../utils/auditLogger.js'; // Unused
import VMSLayout from '../layout/VMSLayout.jsx';
import { ComponentErrorBoundary } from '../ui/ErrorBoundaries';
import { RetrySuspense } from '../ui/SuspenseWrapper';
import { getSkeletonForView } from '../ui/LoadingSkeletons.jsx';
// 🚀 PHASE 2: COMPREHENSIVE LAZY LOADING
// Views
const DashboardView = lazy(() => import('../views/DashboardView.jsx'));
const Residents = lazy(() => import('../residents/Residents.jsx'));
const ShiftHandover = lazy(() => import('../dashboard/ShiftHandover.jsx'));
const AuditTrail = lazy(() => import('./AuditTrail.jsx'));
const LabelsManager = lazy(() => import('./LabelsManager.jsx'));
const IncidentManager = lazy(() => import('./IncidentManager.jsx'));
const LeaveRequests = lazy(() => import('./LeaveRequests.jsx'));
// Modals - Load on demand
const AddResidentModalNew = lazy(
  () => import('../forms/AddResidentModalNew.jsx')
);
const FamilySetupWizard = lazy(() => import('../forms/FamilySetupWizard.jsx'));
const RoomCapacityManager = lazy(() => import('../ui/RoomCapacityManager.jsx'));
// Context-aware loading component with resilience
const ViewLoading = ({ type = 'dashboard' }) => getSkeletonForView(type);

const VMSRefactored = () => {
  const { notify } = useNotifications();
  // const {
  //   processAuditEntry: _processAuditEntry,
  //   getNotificationSettings: _getNotificationSettings,
  //   saveNotificationSettings: _saveNotificationSettings,
  //   DEFAULT_SETTINGS: _DEFAULT_SETTINGS,
  // } = useAuditNotifications();
  useAuditNotifications(); // Keep the hook call

  const {
    residents,
    addResident,
    updateResident,
    deleteResident,
    // archiveResident: _archiveResident,
    updateLabels,
    getActiveResidents,
    // getArchivedResidents: _getArchivedResidents,
    getResidentById,
    // getResidentsByType: _getResidentsByType,
    // getResidentsByLabel: _getResidentsByLabel,
  } = useResidents();

  const {
    state,
    setView,
    toggleSidebar,
    openModal,
    closeModal,
    setSelectedResident,
    // updateResidentForm, // Not used with new modal
    resetResidentForm,
    setSearchTerm,
    setSelectedLabels,
    setSortBy,
    setSortOrder,
    setViewMode,
    // addLeaveRequest: _addLeaveRequest,
    // updateLeaveRequest: _updateLeaveRequest,
    // deleteLeaveRequest: _deleteLeaveRequest,
    // addDocument: _addDocument,
    // deleteDocument: _deleteDocument,
    addAuditLog,
  } = useVMSState();

  const { validateResidentForm } = useValidation();

  // Room capacity state
  const [roomCapacities, setRoomCapacities] = useState({});
  const [showRoomCapacityManager, setShowRoomCapacityManager] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('vms-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.roomCapacities) {
          setRoomCapacities(parsedData.roomCapacities);
        }
        // Data loaded successfully
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever residents or room capacities change
  useEffect(() => {
    const dataToSave = {
      residents,
      roomCapacities,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('vms-data', JSON.stringify(dataToSave));
  }, [residents, roomCapacities]);

  // Handle room capacity updates
  const handleRoomCapacityUpdate = useCallback(
    (newCapacities) => {
      setRoomCapacities(newCapacities);
      addAuditLog({
        action: 'room_capacity_updated',
        details: { roomCapacities: newCapacities },
      });
      notify('Kamer capaciteiten bijgewerkt', { type: 'success' });
    },
    [addAuditLog, notify]
  );

  // Handle resident form submission
  const handleAddResident = useCallback(
    async (formData) => {
      const validation = validateResidentForm(formData);

      if (!validation.valid) {
        notify('Controleer de formuliergegevens', { type: 'error' });
        return { success: false, errors: validation.errors };
      }

      try {
        addResident(formData);

        // Add audit log
        addAuditLog({
          id: `audit_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'resident_added',
          details: `Bewoner ${formData.firstName} ${formData.lastName} toegevoegd`,
          user: 'Admin',
        });

        notify('Bewoner succesvol toegevoegd', { type: 'success' });
        closeModal('addResident');
        resetResidentForm();

        return { success: true };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error adding resident:', error);
        notify(
          'Er is een fout opgetreden bij het toevoegen van de bewoner',
          'error'
        );
        return { success: false, error: error.message };
      }
    },
    [
      validateResidentForm,
      notify,
      addResident,
      addAuditLog,
      closeModal,
      resetResidentForm,
    ]
  );

  // Handle resident update
  const handleUpdateResident = async (formData) => {
    const validation = validateResidentForm(formData);

    if (!validation.valid) {
      notify('Controleer de formuliergegevens', { type: 'error' });
      return { success: false, errors: validation.errors };
    }

    try {
      updateResident(formData);

      // Add audit log
      addAuditLog({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'resident_updated',
        details: `Bewoner ${formData.firstName} ${formData.lastName} bijgewerkt`,
        user: 'Admin',
      });

      notify('Bewoner succesvol bijgewerkt', { type: 'success' });
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating resident:', error);
      notify(
        'Er is een fout opgetreden bij het bijwerken van de bewoner',
        'error'
      );
      return { success: false, error: error.message };
    }
  };

  // Handle resident deletion
  const handleDeleteResident = async (residentId) => {
    try {
      const resident = getResidentById(residentId);
      if (!resident) {
        notify('Bewoner niet gevonden', { type: 'error' });
        return;
      }

      deleteResident(residentId);

      // Add audit log
      addAuditLog({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'resident_deleted',
        details: `Bewoner ${resident.firstName} ${resident.lastName} verwijderd`,
        user: 'Admin',
      });

      notify('Bewoner succesvol verwijderd', { type: 'success' });
      setSelectedResident(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting resident:', error);
      notify(
        'Er is een fout opgetreden bij het verwijderen van de bewoner',
        'error'
      );
    }
  };

  // Render current view
  const renderView = () => {
    switch (state.activeView) {
      case 'dashboard':
        return (
          <ComponentErrorBoundary componentName='Dashboard'>
            <RetrySuspense type='dashboard'>
              <DashboardView residents={residents} />
            </RetrySuspense>
          </ComponentErrorBoundary>
        );

      case 'residents':
        return (
          <div key='residents' className='view-transition'>
            <ComponentErrorBoundary componentName='Residents'>
              <RetrySuspense type='residents'>
                <Residents
                  residents={getActiveResidents()}
                  onSelectResident={setSelectedResident}
                  onAddResident={() => openModal('addResident')}
                  onUpdateResident={handleUpdateResident}
                  onDeleteResident={handleDeleteResident}
                  searchTerm={state.searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedLabels={state.selectedLabels}
                  onLabelsChange={setSelectedLabels}
                  sortBy={state.sortBy}
                  sortOrder={state.sortOrder}
                  onSortChange={setSortBy}
                  onSortOrderChange={setSortOrder}
                  viewMode={state.viewMode}
                  onViewModeChange={setViewMode}
                  onFamilyWizardClick={() => openModal('familyWizard')}
                />
              </RetrySuspense>
            </ComponentErrorBoundary>
          </div>
        );

      case 'leave-requests':
        return (
          <div key='leave-requests' className='view-transition'>
            <Suspense fallback={<ViewLoading type='leaves' />}>
              <LeaveRequests />
            </Suspense>
          </div>
        );

      case 'documents':
        return (
          <div key='documents' className='view-transition'>
            <h3 className='text-lg font-semibold mb-4'>Documenten</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Documenten functionaliteit komt binnenkort...
            </p>
          </div>
        );

      case 'analytics':
        return (
          <div key='analytics' className='view-transition'>
            <h3 className='text-lg font-semibold mb-4'>Analytics</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Analytics functionaliteit komt binnenkort...
            </p>
          </div>
        );

      case 'audit-trail':
        return (
          <Suspense fallback={<ViewLoading type='audit' />}>
            <AuditTrail
              auditLog={state.auditLog}
              onFilterChange={() => {}}
              onExport={() => {}}
            />
          </Suspense>
        );

      case 'incidents':
        return (
          <div key='incidents' className='view-transition'>
            <ComponentErrorBoundary componentName='IncidentManager'>
              <RetrySuspense type='incidents'>
                <IncidentManager />
              </RetrySuspense>
            </ComponentErrorBoundary>
          </div>
        );

      case 'handover':
        return (
          <div key='handover' className='view-transition'>
            <Suspense fallback={<ViewLoading type='handover' />}>
              <ShiftHandover />
            </Suspense>
          </div>
        );

      case 'labels':
        return (
          <div key='labels' className='view-transition'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-lg font-semibold'>Labels Beheer</h3>
              <button
                onClick={() => openModal('labelsManager')}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-gentle'
              >
                Labels Beheren
              </button>
            </div>
            <Suspense fallback={<ViewLoading type='labels' />}>
              <LabelsManager
                onUpdateLabels={updateLabels}
                onClose={() => closeModal('labelsManager')}
              />
            </Suspense>
          </div>
        );

      case 'settings':
        return (
          <div key='settings' className='view-transition'>
            <h3 className='text-lg font-semibold mb-6'>Instellingen</h3>
            <div className='space-y-6'>
              <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
                <h4 className='text-md font-medium mb-2'>
                  Notificatie Instellingen
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Configureer welke notificaties je wilt ontvangen
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return <DashboardView residents={residents} />;
    }
  };

  return (
    <VMSLayout
      activeView={state.activeView}
      setView={setView}
      sidebarCollapsed={state.sidebarCollapsed}
      toggleSidebar={toggleSidebar}
      onRoomCapacityClick={() => setShowRoomCapacityManager(true)}
    >
      {renderView()}

      {/* Modals - Lazy Loaded with Suspense */}
      {state.modals.addResident && (
        <Suspense fallback={<ViewLoading type='modal' />}>
          <AddResidentModalNew
            isOpen={state.modals.addResident}
            onClose={() => closeModal('addResident')}
            onSubmit={handleAddResident}
            onFamilyWizardClick={() => openModal('familyWizard')}
            existingResidents={getActiveResidents()}
            roomCapacities={roomCapacities}
          />
        </Suspense>
      )}

      {state.modals.familyWizard && (
        <Suspense fallback={<ViewLoading type='modal' />}>
          <FamilySetupWizard
            isOpen={state.modals.familyWizard}
            onClose={() => closeModal('familyWizard')}
            onSave={(allMembers, _familyId, _familyMetadata) => {
              // Add all family members to the residents list
              allMembers.forEach((member) => {
                addResident(member);
              });
              closeModal('familyWizard');
              notify('Gezin succesvol aangemaakt', { type: 'success' });
            }}
            caseworkers={[]} // Add caseworkers array - can be populated from state if needed
            existingResidents={getActiveResidents()}
            roomCapacities={roomCapacities}
          />
        </Suspense>
      )}

      {showRoomCapacityManager && (
        <Suspense fallback={<ViewLoading type='modal' />}>
          <RoomCapacityManager
            isOpen={showRoomCapacityManager}
            onClose={() => setShowRoomCapacityManager(false)}
            existingResidents={getActiveResidents()}
            onSave={handleRoomCapacityUpdate}
          />
        </Suspense>
      )}
    </VMSLayout>
  );
};

export default VMSRefactored;
