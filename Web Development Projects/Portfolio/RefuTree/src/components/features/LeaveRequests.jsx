import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, Clock, MapPin, User, 
  CheckCircle, XCircle, AlertTriangle, FileText, Download,
  Upload, Eye, Edit, Trash2, Send, Clock as ClockIcon,
  Calendar as CalendarIcon, Users, Activity, Star
} from 'lucide-react';
import AddLeaveRequestModal from '../forms/AddLeaveRequestModal.jsx';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { useLocation } from '../../contexts/LocationContext.jsx';
import DataService from '../../utils/dataService.js';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalReason, setApprovalReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [residents, setResidents] = useState([]);
  const { addNotification } = useNotifications();
  const { locationType } = useLocation();

  // Load data from DataService on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load leave requests
        let savedRequests = DataService.getLeaveRequests();
        if (!savedRequests || savedRequests.length === 0) {
          // Initialize with demo data
          const demoRequests = [
            // CNO Verlofaanvragen
            {
              id: 1,
              residentId: 1,
              residentName: 'Ahmad Al-Rashid',
              residentPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              locationType: 'CNO',
              type: 'Dag verlof',
              startDate: '2024-01-15',
              endDate: '2024-01-15',
              startTime: '09:00',
              endTime: '18:00',
              destination: 'Amsterdam Centrum',
              reason: 'Bezoek aan familie',
              status: 'Goedgekeurd',
              statusColor: 'green',
              submittedAt: '2024-01-10T10:30:00',
              approvedBy: 'Sarah Johnson',
              approvedAt: '2024-01-11T14:20:00',
              notes: 'Verlof goedgekeurd voor familiebezoek'
            },
            {
              id: 2,
              residentId: 2,
              residentName: 'Fatima Hassan',
              residentPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
              locationType: 'CNO',
              type: 'Meerdere dagen',
              startDate: '2024-01-20',
              endDate: '2024-01-22',
              startTime: '08:00',
              endTime: '20:00',
              destination: 'Rotterdam',
              reason: 'Medische afspraak en bezoek aan vrienden',
              status: 'In behandeling',
              statusColor: 'yellow',
              submittedAt: '2024-01-12T16:45:00',
              approvedBy: null,
              approvedAt: null,
              notes: 'Wacht op medische verklaring'
            },
            {
              id: 3,
              residentId: 3,
              residentName: 'Omar Khalil',
              residentPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              locationType: 'CNO',
              type: 'Dag verlof',
              startDate: '2024-01-18',
              endDate: '2024-01-18',
              startTime: '10:00',
              endTime: '16:00',
              destination: 'Utrecht',
              reason: 'Werk gerelateerd bezoek',
              status: 'Afgewezen',
              statusColor: 'red',
              submittedAt: '2024-01-13T09:15:00',
              approvedBy: 'Maria Rodriguez',
              approvedAt: '2024-01-14T11:30:00',
              notes: 'Verlof afgewezen - werkvergunning nog niet definitief'
            },
            // Oekraïne Verlofaanvragen
            {
              id: 4,
              residentId: 4,
              residentName: 'Olena Kovalenko',
              residentPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              locationType: 'OEKRAINE',
              type: 'Dag verlof',
              startDate: '2024-01-16',
              endDate: '2024-01-16',
              startTime: '10:00',
              endTime: '17:00',
              destination: 'Den Haag',
              reason: 'Afspraak bij ambassade',
              status: 'Goedgekeurd',
              statusColor: 'green',
              submittedAt: '2024-01-11T08:15:00',
              approvedBy: 'John Smith',
              approvedAt: '2024-01-12T10:30:00',
              notes: 'Verlof goedgekeurd voor ambassade bezoek'
            },
            {
              id: 5,
              residentId: 5,
              residentName: 'Viktor Petrenko',
              residentPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
              locationType: 'OEKRAINE',
              type: 'Meerdere dagen',
              startDate: '2024-01-25',
              endDate: '2024-01-27',
              startTime: '07:00',
              endTime: '19:00',
              destination: 'Eindhoven',
              reason: 'Bezoek aan vrienden en medische controle',
              status: 'In behandeling',
              statusColor: 'yellow',
              submittedAt: '2024-01-14T14:20:00',
              approvedBy: null,
              approvedAt: null,
              notes: 'Wacht op medische bevestiging'
            },
            {
              id: 6,
              residentId: 6,
              residentName: 'Oksana Shevchenko',
              residentPhoto: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
              locationType: 'OEKRAINE',
              type: 'Dag verlof',
              startDate: '2024-01-19',
              endDate: '2024-01-19',
              startTime: '09:00',
              endTime: '16:00',
              destination: 'Amsterdam',
              reason: 'Sollicitatiegesprek',
              status: 'Goedgekeurd',
              statusColor: 'green',
              submittedAt: '2024-01-15T09:45:00',
              approvedBy: 'Lisa Williams',
              approvedAt: '2024-01-16T11:15:00',
              notes: 'Verlof goedgekeurd voor sollicitatiegesprek'
            }
          ];
          DataService.setLeaveRequests(demoRequests);
          savedRequests = demoRequests;
        }
        setRequests(savedRequests);

        // Load residents and filter by location
        const savedResidents = DataService.getResidents();
        const locationResidents = (savedResidents || []).filter(r => r.locationType === locationType);
        setResidents(locationResidents);
      } catch (error) {
        console.error('Error loading leave requests data:', error);
        addNotification({
          type: 'error',
          title: 'Fout bij laden data',
          message: 'Er is een fout opgetreden bij het laden van de verlofaanvragen.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [addNotification, locationType]);

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = requests;

    // Location filter - only show requests for current location
    filtered = filtered.filter(request => request.locationType === locationType);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, locationType]);

  const handleAddRequest = (newRequest) => {
    try {
      const updatedRequests = [...requests, newRequest];
      setRequests(updatedRequests);
      DataService.setLeaveRequests(updatedRequests);
      
      // Add notification
      addNotification({
        type: 'info',
        title: 'Nieuwe verlofaanvraag',
        message: `${newRequest.residentName} heeft een verlofaanvraag ingediend voor ${newRequest.startDate}.`,
        action: 'view_leave_request',
        actionData: { requestId: newRequest.id }
      });
    } catch (error) {
      console.error('Error adding leave request:', error);
      addNotification({
        type: 'error',
        title: 'Fout bij toevoegen verlofaanvraag',
        message: 'Er is een fout opgetreden bij het toevoegen van de verlofaanvraag.'
      });
    }
  };

  const handleApproveRequest = (requestId) => {
    try {
      const request = requests.find(r => r.id === requestId);
      const updatedRequests = requests.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            status: 'Goedgekeurd',
            statusColor: 'green',
            approvedBy: 'Huidige gebruiker', // In real app, get from auth context
            approvedAt: new Date().toISOString()
          };
        }
        return request;
      });
      setRequests(updatedRequests);
      DataService.setLeaveRequests(updatedRequests);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Verlofaanvraag goedgekeurd',
        message: `Verlofaanvraag van ${request.residentName} is goedgekeurd.`,
        action: 'view_leave_request',
        actionData: { requestId: requestId }
      });
    } catch (error) {
      console.error('Error approving leave request:', error);
      addNotification({
        type: 'error',
        title: 'Fout bij goedkeuren verlofaanvraag',
        message: 'Er is een fout opgetreden bij het goedkeuren van de verlofaanvraag.'
      });
    }
  };

  const handleRejectRequest = (requestId, reason) => {
    try {
      const updatedRequests = requests.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            status: 'Afgewezen',
            statusColor: 'red',
            approvedBy: 'Huidige gebruiker', // In real app, get from auth context
            approvedAt: new Date().toISOString(),
            notes: reason || 'Verlof afgewezen'
          };
        }
        return request;
      });
      setRequests(updatedRequests);
      DataService.setLeaveRequests(updatedRequests);
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      addNotification({
        type: 'error',
        title: 'Fout bij afwijzen verlofaanvraag',
        message: 'Er is een fout opgetreden bij het afwijzen van de verlofaanvraag.'
      });
    }
  };

  const handleDeleteRequest = (requestId) => {
    if (window.confirm('Weet je zeker dat je deze verlofaanvraag wilt verwijderen?')) {
      try {
        const updatedRequests = requests.filter(request => request.id !== requestId);
        setRequests(updatedRequests);
        DataService.setLeaveRequests(updatedRequests);
      } catch (error) {
        console.error('Error deleting leave request:', error);
        addNotification({
          type: 'error',
          title: 'Fout bij verwijderen verlofaanvraag',
          message: 'Er is een fout opgetreden bij het verwijderen van de verlofaanvraag.'
        });
      }
    }
  };

  // Approval workflow functions
  const openApprovalModal = (request, action) => {
    setSelectedRequest({ ...request, action });
    setApprovalReason('');
    setIsApprovalModalOpen(true);
  };

  const handleApprovalSubmit = () => {
    if (!selectedRequest) return;

    try {
      if (selectedRequest.action === 'approve') {
        handleApproveRequest(selectedRequest.id);
      } else if (selectedRequest.action === 'reject') {
        handleRejectRequest(selectedRequest.id, approvalReason);
      }
      
      setIsApprovalModalOpen(false);
      setSelectedRequest(null);
      setApprovalReason('');
    } catch (error) {
      console.error('Error in approval workflow:', error);
    }
  };

  const closeApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setSelectedRequest(null);
    setApprovalReason('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Goedgekeurd': return 'bg-green-100 text-green-800';
      case 'In behandeling': return 'bg-yellow-100 text-yellow-800';
      case 'Afgewezen': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('nl-NL');
  };

  const getDaysDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 because we count both start and end day
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Verlofaanvragen {locationType === 'CNO' ? 'CNO' : 'Oekraïne'}
          </h1>
          <p className="text-gray-600 mt-1">
            Beheer alle verlofaanvragen ({filteredRequests.length} weergegeven van {requests.length} totaal)
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nieuwe Aanvraag
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totaal</p>
              <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In behandeling</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredRequests.filter(r => r.status === 'In behandeling').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Goedgekeurd</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredRequests.filter(r => r.status === 'Goedgekeurd').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Afgewezen</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredRequests.filter(r => r.status === 'Afgewezen').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zoeken
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Bewoner, bestemming, reden..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle statussen</option>
              <option value="In behandeling">In behandeling</option>
              <option value="Goedgekeurd">Goedgekeurd</option>
              <option value="Afgewezen">Afgewezen</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Filters wissen
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={request.residentPhoto}
                    alt={request.residentName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.residentName}</h3>
                    <p className="text-sm text-gray-600">{request.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  {request.status === 'In behandeling' && (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      {request.startDate !== request.endDate && (
                        <span className="text-gray-500 ml-1">
                          ({getDaysDifference(request.startDate, request.endDate)} dagen)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {request.startTime} - {request.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{request.destination}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Reden:</span>
                    <p className="text-gray-600 mt-1">{request.reason}</p>
                  </div>
                  {request.notes && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Notities:</span>
                      <p className="text-gray-600 mt-1">{request.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <div className="flex items-center gap-4">
                  <span>Ingediend: {formatDateTime(request.submittedAt)}</span>
                  {request.approvedBy && (
                    <span>Beslissing door: {request.approvedBy}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {request.status === 'In behandeling' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => openApprovalModal(request, 'approve')}
                        icon={CheckCircle}
                      >
                        Goedkeuren
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => openApprovalModal(request, 'reject')}
                        icon={XCircle}
                      >
                        Afwijzen
                      </Button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteRequest(request.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Geen verlofaanvragen gevonden
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Probeer je zoekopdracht of filters aan te passen.'
              : 'Voeg je eerste verlofaanvraag toe om te beginnen.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nieuwe Aanvraag Toevoegen
            </button>
          )}
        </div>
      )}

      {/* Add Request Modal */}
      <AddLeaveRequestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddRequest}
        residents={residents}
      />

      {/* Approval Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={closeApprovalModal}
        title={selectedRequest?.action === 'approve' ? 'Verlofaanvraag Goedkeuren' : 'Verlofaanvraag Afwijzen'}
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Verlofaanvraag Details</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Bewoner:</span> {selectedRequest.residentName}</div>
                <div><span className="font-medium">Type:</span> {selectedRequest.type}</div>
                <div><span className="font-medium">Datum:</span> {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}</div>
                <div><span className="font-medium">Tijd:</span> {selectedRequest.startTime} - {selectedRequest.endTime}</div>
                <div><span className="font-medium">Bestemming:</span> {selectedRequest.destination}</div>
                <div><span className="font-medium">Reden:</span> {selectedRequest.reason}</div>
              </div>
            </div>

            {selectedRequest.action === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reden voor afwijzing *
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Geef een reden op voor de afwijzing..."
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={closeApprovalModal}
              >
                Annuleren
              </Button>
              <Button
                variant={selectedRequest.action === 'approve' ? 'success' : 'danger'}
                onClick={handleApprovalSubmit}
                disabled={selectedRequest.action === 'reject' && !approvalReason.trim()}
                icon={selectedRequest.action === 'approve' ? CheckCircle : XCircle}
              >
                {selectedRequest.action === 'approve' ? 'Goedkeuren' : 'Afwijzen'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveRequests; 