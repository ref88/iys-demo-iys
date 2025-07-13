import React, { useState, useEffect } from 'react';
import {
  // X, // Unused
  // Calendar, // Unused
  // Clock, // Unused
  MapPin,
  // FileText, // Unused
  // User, // Unused
  AlertTriangle,
  // CheckCircle, // Unused
  // Save, // Unused
  Send,
} from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import useModalClose from '../../hooks/useModalClose.js';

const AddLeaveRequestModal = ({ isOpen, onClose, onSave, residents }) => {
  const modalClose = useModalClose(onClose);
  const [formData, setFormData] = useState({
    residentId: '',
    type: 'Dag verlof',
    startDate: '',
    endDate: '',
    destination: '',
    reason: '',
    notes: '',
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
        notes: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  // Auto-set end date when start date changes for single day requests
  useEffect(() => {
    if (
      formData.type === 'Dag verlof' &&
      formData.startDate &&
      !formData.endDate
    ) {
      setFormData((prev) => ({
        ...prev,
        endDate: formData.startDate,
      }));
    }
  }, [formData.startDate, formData.type, formData.endDate]);

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
        newErrors.endDate =
          'Einddatum moet na startdatum liggen (minimaal 1 dag verschil)';
      }
      // Controleer max 28 dagen per jaar
      if (formData.residentId && residents && residents.length > 0) {
        const leaveRequests = JSON.parse(
          localStorage.getItem('vms_leave_requests') || '[]'
        );
        const year = start.getFullYear();
        const residentRequests = leaveRequests.filter(
          (r) => r.residentId === formData.residentId
        );
        const daysThisRequest = getDaysDifference(
          formData.startDate,
          formData.endDate
        );
        const daysThisYear = residentRequests.reduce((acc, req) => {
          const reqStart = new Date(req.startDate);
          if (reqStart.getFullYear() === year) {
            acc += getDaysDifference(req.startDate, req.endDate);
          }
          return acc;
        }, 0);
        if (daysThisYear + daysThisRequest > 28) {
          newErrors.endDate =
            'Deze aanvraag overschrijdt het maximum van 28 verlofdagen per jaar voor deze bewoner.';
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const selectedResident = residents.find(
        (r) => r.id === formData.residentId
      );

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
        approvedAt: null,
      };

      onSave(newRequest);
      // Use smooth close for save operations
      modalClose.saveAndClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding leave request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const _handleClose = () => {
  //   if (!isSubmitting) {
  //     modalClose.cancel();
  //   }
  // };

  return (
    <Modal
      isOpen={isOpen}
      onClose={modalClose.dismiss}
      title='Nieuwe Verlofaanvraag'
      size='lg'
    >
      <form onSubmit={handleSubmit}>
        <div className='space-y-6'>
          {/* Resident Selection */}
          <div>
            <label
              htmlFor='residentId'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Bewoner *
            </label>
            <select
              id='residentId'
              name='residentId'
              value={formData.residentId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.residentId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value=''>Selecteer bewoner</option>
              {residents.map((resident) => (
                <option key={resident.id} value={resident.id}>
                  {resident.name} - Kamer {resident.room} ({resident.vNumber})
                </option>
              ))}
            </select>
            {errors.residentId && (
              <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                <AlertTriangle className='w-3 h-3' />
                {errors.residentId}
              </p>
            )}
          </div>

          {/* Request Type */}
          <div>
            <label
              htmlFor='leaveType'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Type verlof
            </label>
            <select
              id='leaveType'
              name='type'
              value={formData.type}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='Dag verlof'>Dag verlof</option>
              <option value='Meerdere dagen'>Meerdere dagen</option>
              <option value='Avond verlof'>Avond verlof</option>
              <option value='Weekend verlof'>Weekend verlof</option>
            </select>
          </div>

          {/* Dates */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='startDate'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Startdatum *
              </label>
              <input
                type='date'
                id='startDate'
                name='startDate'
                value={formData.startDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                  <AlertTriangle className='w-3 h-3' />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='endDate'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Einddatum *
              </label>
              <input
                type='date'
                id='endDate'
                name='endDate'
                value={formData.endDate}
                onChange={handleInputChange}
                min={
                  formData.startDate || new Date().toISOString().split('T')[0]
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                  <AlertTriangle className='w-3 h-3' />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Destination */}
          <div>
            <label
              htmlFor='destination'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Bestemming *
            </label>
            <div className='relative'>
              <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                id='destination'
                name='destination'
                value={formData.destination}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.destination ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Bijv. Amsterdam Centrum, Rotterdam, Utrecht...'
              />
            </div>
            {errors.destination && (
              <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                <AlertTriangle className='w-3 h-3' />
                {errors.destination}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label
              htmlFor='reason'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Reden voor verlof *
            </label>
            <textarea
              id='reason'
              name='reason'
              value={formData.reason}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Beschrijf de reden voor het verlof...'
            />
            {errors.reason && (
              <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                <AlertTriangle className='w-3 h-3' />
                {errors.reason}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor='notes'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Extra notities
            </label>
            <textarea
              id='notes'
              name='notes'
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Optionele extra informatie...'
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-8 flex justify-end gap-3 pt-6 border-t'>
          <Button
            type='button'
            variant='outline'
            onClick={modalClose.cancel}
            disabled={isSubmitting}
          >
            Annuleren
          </Button>
          <Button
            type='submit'
            variant='primary'
            disabled={isSubmitting}
            loading={isSubmitting}
            icon={Send}
          >
            {isSubmitting ? 'Versturen...' : 'Verlofaanvraag Indienen'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLeaveRequestModal;
