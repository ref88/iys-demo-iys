import React from 'react';
import { Phone } from 'lucide-react';

const ContactInfoSection = ({ formData, onInputChange, caseworkers = [] }) => {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
        <Phone className='w-5 h-5' />
        Contact Informatie
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label
            htmlFor='contact-phone'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Telefoon
          </label>
          <input
            id='contact-phone'
            type='tel'
            name='phone'
            value={formData.phone || ''}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='+31 6 12345678'
          />
        </div>

        <div>
          <label
            htmlFor='contact-email'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            E-mail
          </label>
          <input
            id='contact-email'
            type='email'
            name='email'
            value={formData.email || ''}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='email@example.com'
          />
        </div>

        <div>
          <label
            htmlFor='contact-room'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Kamer *
          </label>
          <input
            id='contact-room'
            type='text'
            name='room'
            value={formData.room || ''}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Kamernummer'
          />
        </div>

        <div>
          <label
            htmlFor='contact-caseworker'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Begeleider *
          </label>
          <select
            id='contact-caseworker'
            name='caseworker'
            value={formData.caseworker || ''}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Selecteer begeleider</option>
            {caseworkers.map((worker) => (
              <option key={worker} value={worker}>
                {worker}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;
