import React, { useState, useEffect } from 'react';
import { 
  X, UserPlus, Users, Clock, Calendar, AlertTriangle, 
  CheckCircle, XCircle, UserCheck, UserX, Save
} from 'lucide-react';

const ShiftAssignmentModal = ({ 
  isOpen, 
  onClose, 
  shift, 
  staffMembers, 
  shiftTypes, 
  onAssignmentUpdate,
  currentUser 
}) => {
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [swapRequest, setSwapRequest] = useState({
    requesterId: null,
    requestedShiftId: null,
    reason: '',
    status: 'pending' // 'pending', 'approved', 'rejected'
  });

  useEffect(() => {
    if (shift) {
      setSelectedStaff(shift.assignedStaff || []);
      setSwapRequests(shift.swapRequests || []);
    }
  }, [shift]);

  const shiftType = shiftTypes?.find(st => st.id === shift?.shiftType);

  const handleStaffToggle = (staffId) => {
    if (selectedStaff.includes(staffId)) {
      setSelectedStaff(selectedStaff.filter(id => id !== staffId));
    } else {
      // Check if we can add more staff
      if (selectedStaff.length < shiftType?.maxStaff) {
        setSelectedStaff([...selectedStaff, staffId]);
      }
    }
  };

  const handleSave = () => {
    if (onAssignmentUpdate) {
      onAssignmentUpdate({
        ...shift,
        assignedStaff: selectedStaff
      });
    }
    onClose();
  };

  const handleSwapRequest = () => {
    if (!swapRequest.requesterId || !swapRequest.requestedShiftId || !swapRequest.reason) {
      return;
    }

    const newSwapRequest = {
      id: Date.now(),
      ...swapRequest,
      timestamp: new Date().toISOString(),
      createdBy: currentUser?.id
    };

    setSwapRequests([...swapRequests, newSwapRequest]);
    setSwapRequest({
      requesterId: null,
      requestedShiftId: null,
      reason: '',
      status: 'pending'
    });
    setShowSwapForm(false);
  };

  const handleSwapApproval = (requestId, status) => {
    const updatedRequests = swapRequests.map(req => 
      req.id === requestId ? { ...req, status, approvedBy: currentUser?.id } : req
    );
    setSwapRequests(updatedRequests);
  };

  const getStaffMember = (staffId) => {
    return staffMembers?.find(staff => staff.id === staffId);
  };

  const canManageSwaps = currentUser?.role === 'Admin' || currentUser?.role === 'Coordinator';

  if (!isOpen || !shift) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Dienst Toewijzing - {shiftType?.name}
            </h3>
            <p className="text-sm text-gray-600">
              {new Date(shift.date).toLocaleDateString('nl-NL')} • {shift.startTime} - {shift.endTime}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Shift Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">Datum: {new Date(shift.date).toLocaleDateString('nl-NL')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">Tijd: {shift.startTime} - {shift.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">Max: {shiftType?.maxStaff} medewerkers</span>
              </div>
            </div>
          </div>

          {/* Staff Assignment */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Medewerkers Toewijzen</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffMembers?.map(staff => (
                <div
                  key={staff.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedStaff.includes(staff.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    selectedStaff.length >= shiftType?.maxStaff && !selectedStaff.includes(staff.id)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={() => handleStaffToggle(staff.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{staff.name}</div>
                      <div className="text-sm text-gray-500">{staff.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedStaff.includes(staff.id) && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                      {staff.isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedStaff.length >= shiftType?.maxStaff && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Maximum aantal medewerkers bereikt voor deze dienst
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Swap Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">Ruilaanvragen</h4>
              {canManageSwaps && (
                <button
                  onClick={() => setShowSwapForm(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Nieuwe Ruilaanvraag
                </button>
              )}
            </div>

            {swapRequests.length > 0 ? (
              <div className="space-y-3">
                {swapRequests.map(request => {
                  const requester = getStaffMember(request.requesterId);
                  return (
                    <div
                      key={request.id}
                      className={`p-4 border rounded-lg ${
                        request.status === 'approved' ? 'border-green-200 bg-green-50' :
                        request.status === 'rejected' ? 'border-red-200 bg-red-50' :
                        'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {requester?.name} wil ruilen
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {request.reason}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(request.timestamp).toLocaleString('nl-NL')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status === 'pending' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                              In afwachting
                            </span>
                          )}
                          {request.status === 'approved' && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              Goedgekeurd
                            </span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                              Afgewezen
                            </span>
                          )}
                          
                          {canManageSwaps && request.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSwapApproval(request.id, 'approved')}
                                className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSwapApproval(request.id, 'rejected')}
                                className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Geen ruilaanvragen</p>
              </div>
            )}
          </div>

          {/* Swap Request Form */}
          {showSwapForm && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">Nieuwe Ruilaanvraag</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aanvrager
                  </label>
                  <select
                    value={swapRequest.requesterId || ''}
                    onChange={(e) => setSwapRequest({...swapRequest, requesterId: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Selecteer medewerker</option>
                    {staffMembers?.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.role})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reden voor ruil
                  </label>
                  <textarea
                    value={swapRequest.reason}
                    onChange={(e) => setSwapRequest({...swapRequest, reason: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    rows="3"
                    placeholder="Beschrijf de reden voor de ruilaanvraag..."
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleSwapRequest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Aanvraag Indienen
                  </button>
                  <button
                    onClick={() => setShowSwapForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <div className="text-sm text-gray-600">
            {selectedStaff.length} van {shiftType?.maxStaff} medewerkers toegewezen
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Opslaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftAssignmentModal; 