import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Plus,
  Calendar,
  User,
  FileText,
  X,
  Save,
  Shield,
  Trash2,
  CheckCircle,
  Search,
  Eye,
  Activity,
  Clock,
} from 'lucide-react';
import { logAuditAction } from '../../utils/auditLogger.js';
import DataService from '../../utils/dataService.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useNotifications } from '../../contexts/NotificationContext.jsx';

const IncidentManager = () => {
  const { currentUser } = useAuth();
  const { notify } = useNotifications();

  const [incidents, setIncidents] = useState([]);
  // const [_residents, _setResidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [newIncident, setNewIncident] = useState({
    type: '',
    title: '',
    description: '',
    priority: 'medium',
    location: '',
    residentIds: [],
    witnessIds: [],
    status: 'open',
    immediateAction: '',
    followUpRequired: false,
    followUpDate: '',
    followUpActions: '',
    reportedBy: currentUser?.name || '',
    reportedAt: new Date().toISOString(),
    images: [],
    documents: [],
  });

  // Load data on mount
  useEffect(() => {
    loadIncidents();
    loadResidents();
  }, []);

  const loadIncidents = async () => {
    const savedIncidents = (await DataService.getIncidentsAsync()) || [];
    setIncidents(savedIncidents);
  };

  const loadResidents = () => {
    // const savedResidents = DataService.getResidents() || [];
    // _setResidents(savedResidents);
  };

  const filterIncidents = useCallback(() => {
    let filtered = [...incidents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (incident) =>
          incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (incident) => incident.status === statusFilter
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(
        (incident) => incident.priority === priorityFilter
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (incident) => new Date(incident.reportedAt) >= filterDate
          );
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(
            (incident) => new Date(incident.reportedAt) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(
            (incident) => new Date(incident.reportedAt) >= filterDate
          );
          break;
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

    setFilteredIncidents(filtered);
  }, [incidents, searchTerm, statusFilter, priorityFilter, dateFilter]);

  // Filter incidents when search/filter changes
  useEffect(() => {
    filterIncidents();
  }, [
    incidents,
    searchTerm,
    statusFilter,
    priorityFilter,
    dateFilter,
    filterIncidents,
  ]);

  const saveIncident = (incident) => {
    const updatedIncidents = incident.id
      ? incidents.map((i) => (i.id === incident.id ? incident : i))
      : [...incidents, { ...incident, id: `incident-${Date.now()}` }];

    setIncidents(updatedIncidents);
    DataService.saveIncident(incident);

    // Log audit action
    logAuditAction('incident', incident.id ? 'update' : 'create', {
      incidentId: incident.id || `incident-${Date.now()}`,
      type: incident.type,
      priority: incident.priority,
      user: currentUser?.name,
    });
  };

  const submitIncident = () => {
    if (!newIncident.title || !newIncident.type || !newIncident.description) {
      notify('Vul alle verplichte velden in', { type: 'error' });
      return;
    }

    const incident = {
      ...newIncident,
      id: `incident-${Date.now()}`,
      reportedAt: new Date().toISOString(),
    };

    saveIncident(incident);

    notify('Incident succesvol gerapporteerd', { type: 'success' });

    // Reset form
    setNewIncident({
      type: '',
      title: '',
      description: '',
      priority: 'medium',
      location: '',
      residentIds: [],
      witnessIds: [],
      status: 'open',
      immediateAction: '',
      followUpRequired: false,
      followUpDate: '',
      followUpActions: '',
      reportedBy: currentUser?.name || '',
      reportedAt: new Date().toISOString(),
      images: [],
      documents: [],
    });

    setShowAddForm(false);
  };

  const updateIncidentStatus = (incidentId, newStatus) => {
    const updatedIncidents = incidents.map((incident) =>
      incident.id === incidentId
        ? {
            ...incident,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.name,
          }
        : incident
    );

    setIncidents(updatedIncidents);
    DataService.saveIncidents(updatedIncidents);

    notify(`Incident status gewijzigd naar ${newStatus}`, { type: 'info' });
  };

  const deleteIncident = (incidentId) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Weet je zeker dat je dit incident wilt verwijderen?')) {
      const updatedIncidents = incidents.filter(
        (incident) => incident.id !== incidentId
      );
      setIncidents(updatedIncidents);
      DataService.saveIncidents(updatedIncidents);

      notify('Incident verwijderd', { type: 'warning' });
    }
  };

  const getIncidentStats = () => {
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: incidents.length,
      open: incidents.filter((i) => i.status === 'open').length,
      inProgress: incidents.filter((i) => i.status === 'in_progress').length,
      resolved: incidents.filter((i) => i.status === 'resolved').length,
      high: incidents.filter((i) => i.priority === 'high').length,
      today: incidents.filter(
        (i) => new Date(i.reportedAt) >= today.setHours(0, 0, 0, 0)
      ).length,
      thisWeek: incidents.filter((i) => new Date(i.reportedAt) >= thisWeek)
        .length,
      thisMonth: incidents.filter((i) => new Date(i.reportedAt) >= thisMonth)
        .length,
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const renderOverviewTab = () => {
    const stats = getIncidentStats();

    return (
      <div className='space-y-6'>
        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700'>
            <div className='flex items-center'>
              <FileText className='w-8 h-8 text-blue-600' />
              <div className='ml-3'>
                <p className='text-sm font-medium text-blue-600 dark:text-blue-400'>
                  Totaal Incidenten
                </p>
                <p className='text-2xl font-bold text-blue-900 dark:text-blue-200'>
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-700'>
            <div className='flex items-center'>
              <AlertTriangle className='w-8 h-8 text-red-600' />
              <div className='ml-3'>
                <p className='text-sm font-medium text-red-600 dark:text-red-400'>
                  Open
                </p>
                <p className='text-2xl font-bold text-red-900 dark:text-red-200'>
                  {stats.open}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700'>
            <div className='flex items-center'>
              <Clock className='w-8 h-8 text-yellow-600' />
              <div className='ml-3'>
                <p className='text-sm font-medium text-yellow-600 dark:text-yellow-400'>
                  In Behandeling
                </p>
                <p className='text-2xl font-bold text-yellow-900 dark:text-yellow-200'>
                  {stats.inProgress}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700'>
            <div className='flex items-center'>
              <CheckCircle className='w-8 h-8 text-green-600' />
              <div className='ml-3'>
                <p className='text-sm font-medium text-green-600 dark:text-green-400'>
                  Opgelost
                </p>
                <p className='text-2xl font-bold text-green-900 dark:text-green-200'>
                  {stats.resolved}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Recente Activiteit
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.today}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-300'>
                Vandaag
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.thisWeek}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-300'>
                Deze Week
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.thisMonth}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-300'>
                Deze Maand
              </div>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Recente Incidenten
            </h3>
          </div>
          <div className='divide-y divide-gray-200 dark:divide-gray-700'>
            {filteredIncidents.slice(0, 5).map((incident) => (
              <div
                key={incident.id}
                className='p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                onClick={() => setSelectedIncident(incident)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedIncident(incident);
                  }
                }}
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(incident.priority)}`}
                      >
                        {incident.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}
                      >
                        {incident.status}
                      </span>
                    </div>
                    <p className='font-medium text-gray-900 mt-1'>
                      {incident.title}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {incident.type} • {incident.location}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-gray-500'>
                      {new Date(incident.reportedAt).toLocaleDateString(
                        'nl-NL'
                      )}
                    </p>
                    <p className='text-xs text-gray-400'>
                      {incident.reportedBy}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderIncidentForm = () => (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
          Nieuw Incident Rapporteren
        </h3>
        <button
          onClick={() => setShowAddForm(false)}
          className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        >
          <X className='w-6 h-6' />
        </button>
      </div>

      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='incident-type'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
            >
              Type Incident *
            </label>
            <select
              id='incident-type'
              className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              value={newIncident.type}
              onChange={(e) =>
                setNewIncident({ ...newIncident, type: e.target.value })
              }
            >
              <option value=''>Selecteer type...</option>
              <option value='Medisch'>Medisch Incident</option>
              <option value='Veiligheid'>Veiligheid</option>
              <option value='Conflict'>Conflict</option>
              <option value='Schade'>Schade aan Eigendom</option>
              <option value='Gedrag'>Gedragsprobleem</option>
              <option value='Vermissing'>Vermissing</option>
              <option value='Brand'>Brand/Evacuatie</option>
              <option value='Anders'>Anders</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='incident-priority'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
            >
              Prioriteit *
            </label>
            <select
              id='incident-priority'
              className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              value={newIncident.priority}
              onChange={(e) =>
                setNewIncident({ ...newIncident, priority: e.target.value })
              }
            >
              <option value='low'>Laag</option>
              <option value='medium'>Gemiddeld</option>
              <option value='high'>Hoog</option>
              <option value='critical'>Kritiek</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor='incident-title'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
          >
            Titel *
          </label>
          <input
            type='text'
            id='incident-title'
            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='Korte beschrijving van het incident...'
            value={newIncident.title}
            onChange={(e) =>
              setNewIncident({ ...newIncident, title: e.target.value })
            }
          />
        </div>

        <div>
          <label
            htmlFor='incident-location'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
          >
            Locatie
          </label>
          <input
            type='text'
            id='incident-location'
            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='Waar vond het incident plaats...'
            value={newIncident.location}
            onChange={(e) =>
              setNewIncident({ ...newIncident, location: e.target.value })
            }
          />
        </div>

        <div>
          <label
            htmlFor='incident-description'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
          >
            Beschrijving *
          </label>
          <textarea
            id='incident-description'
            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            rows={4}
            placeholder='Gedetailleerde beschrijving van wat er gebeurd is...'
            value={newIncident.description}
            onChange={(e) =>
              setNewIncident({ ...newIncident, description: e.target.value })
            }
          />
        </div>

        <div>
          <label
            htmlFor='incident-immediate-action'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
          >
            Directe Actie Ondernomen
          </label>
          <textarea
            id='incident-immediate-action'
            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            rows={3}
            placeholder='Welke directe actie heb je ondernomen...'
            value={newIncident.immediateAction}
            onChange={(e) =>
              setNewIncident({
                ...newIncident,
                immediateAction: e.target.value,
              })
            }
          />
        </div>

        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='followUpRequired'
            checked={newIncident.followUpRequired}
            onChange={(e) =>
              setNewIncident({
                ...newIncident,
                followUpRequired: e.target.checked,
              })
            }
            className='rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700'
          />
          <label
            htmlFor='followUpRequired'
            className='text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            Follow-up actie vereist
          </label>
        </div>

        {newIncident.followUpRequired && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='incident-followup-date'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Follow-up Datum
              </label>
              <input
                type='date'
                id='incident-followup-date'
                className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                value={newIncident.followUpDate}
                onChange={(e) =>
                  setNewIncident({
                    ...newIncident,
                    followUpDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label
                htmlFor='incident-followup-actions'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Follow-up Acties
              </label>
              <textarea
                id='incident-followup-actions'
                className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                rows={2}
                placeholder='Beschrijf de follow-up acties...'
                value={newIncident.followUpActions}
                onChange={(e) =>
                  setNewIncident({
                    ...newIncident,
                    followUpActions: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}

        <div className='flex justify-end space-x-3 pt-4'>
          <button
            onClick={() => setShowAddForm(false)}
            className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
          >
            Annuleren
          </button>
          <button
            onClick={submitIncident}
            className='px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center'
          >
            <Save className='w-4 h-4 mr-2' />
            Incident Rapporteren
          </button>
        </div>
      </div>
    </div>
  );

  const renderIncidentsList = () => (
    <div className='space-y-4'>
      {/* Search and Filters */}
      <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
          <div className='lg:col-span-2'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Zoek incidenten...'
                className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className='border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value='all'>Alle Statussen</option>
            <option value='open'>Open</option>
            <option value='in_progress'>In Behandeling</option>
            <option value='resolved'>Opgelost</option>
            <option value='closed'>Gesloten</option>
          </select>

          <select
            className='border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value='all'>Alle Prioriteiten</option>
            <option value='critical'>Kritiek</option>
            <option value='high'>Hoog</option>
            <option value='medium'>Gemiddeld</option>
            <option value='low'>Laag</option>
          </select>

          <select
            className='border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value='all'>Alle Datums</option>
            <option value='today'>Vandaag</option>
            <option value='week'>Deze Week</option>
            <option value='month'>Deze Maand</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700'>
        {filteredIncidents.length === 0 ? (
          <div className='p-8 text-center'>
            <AlertTriangle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500 dark:text-gray-400'>
              Geen incidenten gevonden
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className='p-4 hover:bg-gray-50 dark:hover:bg-gray-700'
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(incident.priority)}`}
                    >
                      {incident.priority}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}
                    >
                      {incident.status}
                    </span>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      {incident.type}
                    </span>
                  </div>

                  <h4 className='font-medium text-gray-900 dark:text-white mb-1'>
                    {incident.title}
                  </h4>
                  <p className='text-sm text-gray-600 dark:text-gray-300 mb-2'>
                    {incident.description.substring(0, 150)}...
                  </p>

                  <div className='flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400'>
                    <span className='flex items-center'>
                      <Calendar className='w-3 h-3 mr-1' />
                      {new Date(incident.reportedAt).toLocaleDateString(
                        'nl-NL'
                      )}
                    </span>
                    <span className='flex items-center'>
                      <User className='w-3 h-3 mr-1' />
                      {incident.reportedBy}
                    </span>
                    {incident.location && (
                      <span className='flex items-center'>
                        <Shield className='w-3 h-3 mr-1' />
                        {incident.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => setSelectedIncident(incident)}
                    className='p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                    title='Bekijk details'
                  >
                    <Eye className='w-4 h-4' />
                  </button>

                  <select
                    value={incident.status}
                    onChange={(e) =>
                      updateIncidentStatus(incident.id, e.target.value)
                    }
                    className='text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1'
                  >
                    <option value='open'>Open</option>
                    <option value='in_progress'>In Behandeling</option>
                    <option value='resolved'>Opgelost</option>
                    <option value='closed'>Gesloten</option>
                  </select>

                  <button
                    onClick={() => deleteIncident(incident.id)}
                    className='p-2 text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
                    title='Verwijder incident'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className='max-w-7xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 flex items-center'>
              <AlertTriangle className='w-8 h-8 mr-3 text-red-600' />
              Incident Management
            </h1>
            <p className='text-gray-600 mt-1'>
              Rapporteer en beheer incidenten
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className='bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center'
          >
            <Plus className='w-4 h-4 mr-2' />
            Nieuw Incident
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='border-b border-gray-200 mb-6'>
        <nav className='-mb-px flex space-x-8'>
          {[
            { id: 'overview', label: 'Overzicht', icon: Activity },
            { id: 'incidents', label: 'Incidenten', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className='w-4 h-4 mr-2' />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'incidents' && renderIncidentsList()}
      </div>

      {/* Incident Form Modal */}
      {showAddForm && (
        <div className='fixed inset-0 z-50 min-h-screen'>
          <button
            className='absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default'
            onClick={() => setShowAddForm(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowAddForm(false);
            }}
            aria-label='Close modal'
            type='button'
          />
          <div className='relative flex items-center justify-center p-4 min-h-screen'>
            <div
              className='bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-auto'
              role='dialog'
              aria-modal='true'
            >
              {renderIncidentForm()}
            </div>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className='fixed inset-0 z-50 min-h-screen'>
          <button
            className='absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default'
            onClick={() => setSelectedIncident(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSelectedIncident(null);
            }}
            aria-label='Close modal'
            type='button'
          />
          <div className='relative flex items-center justify-center p-4 min-h-screen'>
            <div
              className='bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto'
              role='dialog'
              aria-modal='true'
            >
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Incident Details
                  </h3>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className='text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                  >
                    <X className='w-6 h-6' />
                  </button>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedIncident.priority)}`}
                    >
                      {selectedIncident.priority}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedIncident.status)}`}
                    >
                      {selectedIncident.status}
                    </span>
                  </div>

                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white'>
                      {selectedIncident.title}
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      {selectedIncident.type} • {selectedIncident.location}
                    </p>
                  </div>

                  <div>
                    <h5 className='font-medium text-gray-900 dark:text-white mb-2'>
                      Beschrijving
                    </h5>
                    <p className='text-gray-700 dark:text-gray-300'>
                      {selectedIncident.description}
                    </p>
                  </div>

                  {selectedIncident.immediateAction && (
                    <div>
                      <h5 className='font-medium text-gray-900 mb-2'>
                        Directe Actie
                      </h5>
                      <p className='text-gray-700'>
                        {selectedIncident.immediateAction}
                      </p>
                    </div>
                  )}

                  <div className='border-t pt-4'>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='font-medium text-gray-900'>
                          Gerapporteerd door:
                        </span>
                        <p className='text-gray-700'>
                          {selectedIncident.reportedBy}
                        </p>
                      </div>
                      <div>
                        <span className='font-medium text-gray-900'>
                          Datum & Tijd:
                        </span>
                        <p className='text-gray-700'>
                          {new Date(
                            selectedIncident.reportedAt
                          ).toLocaleDateString('nl-NL')}{' '}
                          {new Date(
                            selectedIncident.reportedAt
                          ).toLocaleTimeString('nl-NL')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentManager;
