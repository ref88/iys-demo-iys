import React from 'react';
import { /* Star, */ Activity /* Shield */ } from 'lucide-react';

const StatusSection = ({
  formData,
  onInputChange,
  locationType,
  _bsnRequested,
  _onBsnRequestToggle,
}) => {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
        <Activity className='w-5 h-5' />
        Status & Prioriteit
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label
            htmlFor='status-status'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Status *
          </label>
          <select
            id='status-status'
            name='status'
            value={formData.status || 'In procedure'}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='In procedure'>In procedure</option>
            <option value='Tijdelijke bescherming'>
              Tijdelijke bescherming
            </option>
            <option value='Afgewezen'>Afgewezen</option>
          </select>
        </div>

        <div>
          <label
            htmlFor='status-priority'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Prioriteit
          </label>
          <select
            id='status-priority'
            name='priority'
            value={formData.priority || 'Normal'}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='Low'>Laag</option>
            <option value='Normal'>Normaal</option>
            <option value='High'>Hoog</option>
          </select>
        </div>

        <div>
          <label
            htmlFor='status-nummer'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            {locationType === 'CNO' ? 'V-nummer' : 'BSN'}
          </label>
          <div className='space-y-2'>
            <input
              id='status-nummer'
              type='text'
              name='nummerWaarde'
              value={formData.nummerWaarde || ''}
              onChange={onInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder={
                locationType === 'CNO' ? 'V-2024-123456' : '123456789'
              }
            />

            {locationType === 'OEKRAINE' && (
              <div className='space-y-2'>
                <select
                  id='status-bsn-status'
                  name='bsnStatus'
                  value={formData.bsnStatus || 'toegekend'}
                  onChange={onInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='toegekend'>BSN Toegekend</option>
                  <option value='aangevraagd'>BSN Aangevraagd</option>
                  <option value='geweigerd'>BSN Geweigerd</option>
                </select>

                {formData.bsnStatus === 'aangevraagd' && (
                  <div className='p-2 bg-blue-50 border border-blue-200 rounded'>
                    <p className='text-xs text-blue-700'>
                      BSN aanvraag is ingediend bij de gemeente
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor='status-notes'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Opmerkingen
          </label>
          <textarea
            id='status-notes'
            name='notes'
            value={formData.notes || ''}
            onChange={onInputChange}
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Aanvullende opmerkingen...'
          />
        </div>
      </div>
    </div>
  );
};

export default StatusSection;
