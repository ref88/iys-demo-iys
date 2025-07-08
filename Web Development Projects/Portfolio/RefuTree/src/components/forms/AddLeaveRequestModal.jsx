import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, MapPin, FileText, User, 
  AlertTriangle, CheckCircle, Save, Send, Plus
} from 'lucide-react';

const AddLeaveRequestModal = ({ isOpen, onClose, onSave, residents }) => {
  const [formData, setFormData] = useState({
    residentId: '',
    type: 'Dag verlof',
    startDate: '',
    endDate: '',
    destination: '',
    reason: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        residentId: '',
        type: 'Dag verlof',
        startDate: '',
        endDate: '',
        destination: '',
        reason: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  // Auto-set end date when start date changes for single day requests
  useEffect(() => {
    if (formData.type === 'Dag verlof' && formData.startDate && !formData.endDate) {
      setFormData(prev => ({
        ...prev,
        endDate: formData.startDate
      }));
    }
  }, [formData.startDate, formData.type]);

  const getDaysDifference = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.residentId) {
      newErrors.residentId = 'Bewoner is verplicht';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Startdatum is verplicht';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Einddatum is verplicht';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'Einddatum moet na startdatum liggen (minimaal 1 dag verschil)';
      }
      // Controleer max 28 dagen per jaar
      if (formData.residentId && residents && residents.length > 0) {
        const leaveRequests = JSON.parse(localStorage.getItem('vms_leave_requests') || '[]');
        const year = start.getFullYear();
        const residentRequests = leaveRequests.filter(r => r.residentId == formData.residentId);
        const daysThisRequest = getDaysDifference(formData.startDate, formData.endDate);
        const daysThisYear = residentRequests.reduce((acc, req) => {
          const reqStart = new Date(req.startDate);
          const reqEnd = new Date(req.endDate);
          if (reqStart.getFullYear() === year) {
            acc += getDaysDifference(req.startDate, req.endDate);
          }
          return acc;
        }, 0);
        if (daysThisYear + daysThisRequest > 28) {
          newErrors.endDate = 'Deze aanvraag overschrijdt het maximum van 28 verlofdagen per jaar voor deze bewoner.';
        }
      }
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Bestemming is verplicht';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reden is verplicht';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const selectedResident = residents.find(r => r.id == formData.residentId);
      
      const newRequest = {
        id: Date.now(),
        residentId: parseInt(formData.residentId),
        residentName: selectedResident.name,
        residentPhoto: selectedResident.photo,
        ...formData,
        status: 'In behandeling',
        statusColor: 'yellow',
        submittedAt: new Date().toISOString(),
        approvedBy: null,
        approvedAt: null
      };

      onSave(newRequest);
      onClose();
    } catch (error) {
      console.error('Error adding leave request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Nieuwe Verlofaanvraag
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Resident Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bewoner *
              </label>
              <select
                name="residentId"
                value={formData.residentId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.residentId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecteer bewoner</option>
                {residents.map(resident => (
                  <option key={resident.id} value={resident.id}>
                    {resident.name} - Kamer {resident.room} ({resident.vNumber})
                  </option>
                ))}
              </select>
              {errors.residentId && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.residentId}
                </p>
              )}
            </div>

            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type verlof
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Dag verlof">Dag verlof</option>
                <option value="Meerdere dagen">Meerdere dagen</option>
                <option value="Avond verlof">Avond verlof</option>
                <option value="Weekend verlof">Weekend verlof</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Startdatum *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Einddatum *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>


            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bestemming *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.destination ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Bijv. Amsterdam Centrum, Rotterdam, Utrecht..."
                />
              </div>
              {errors.destination && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.destination}
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reden voor verlof *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Beschrijf de reden voor het verlof..."
              />
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.reason}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extra notities
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optionele extra informatie..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Versturen...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Verlofaanvraag Indienen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveRequestModal; 