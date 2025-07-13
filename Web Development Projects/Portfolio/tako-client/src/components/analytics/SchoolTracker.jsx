import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Search,
  Edit,
  Eye,
} from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { exportAnalytics } from '../../utils/excelExport.js';
import { calculateAge } from '../../utils/dateUtils.js';

// 📚 School Status Badge Component
const SchoolStatusBadge = ({ status }) => {
  const statusConfig = {
    SCHOOL: { color: 'bg-green-100 text-green-800', label: 'Op school' },
    GEEN_SCHOOL: { color: 'bg-red-100 text-red-800', label: 'Geen school' },
    NIET_LEERPLICHTIG: {
      color: 'bg-gray-100 text-gray-800',
      label: 'Niet leerplichtig',
    },
    LEERPLICHTIG: {
      color: 'bg-orange-100 text-orange-800',
      label: 'Leerplichtig',
    },
  };

  const config = statusConfig[status] || statusConfig['GEEN_SCHOOL'];

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
};

// 🎓 School Type Badge Component
const SchoolTypeBadge = ({ type }) => {
  const typeConfig = {
    BASIS: { color: 'bg-blue-100 text-blue-800', label: 'Basisschool' },
    SBO: { color: 'bg-orange-100 text-orange-800', label: 'SBO' },
    MIDDELBARE: {
      color: 'bg-purple-100 text-purple-800',
      label: 'Middelbare school',
    },
    ISK: { color: 'bg-yellow-100 text-yellow-800', label: 'ISK' },
    SPECIAAL: {
      color: 'bg-pink-100 text-pink-800',
      label: 'Speciaal onderwijs',
    },
  };

  const config = typeConfig[type] || {
    color: 'bg-gray-100 text-gray-800',
    label: 'Onbekend',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
};

// 📊 School Stats Card Component
const SchoolStatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  percentage,
}) => (
  <div className='bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-3'>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <h3 className='text-sm font-medium text-gray-500'>{title}</h3>
          <p className='text-2xl font-bold text-gray-900'>{value}</p>
          {subtitle && <p className='text-sm text-gray-500 mt-1'>{subtitle}</p>}
        </div>
      </div>
      {percentage && (
        <div className='text-right'>
          <div className='text-lg font-semibold text-gray-900'>
            {percentage}%
          </div>
          <div className='text-sm text-gray-500'>van totaal</div>
        </div>
      )}
    </div>
  </div>
);

// 👤 Student Row Component
const StudentRow = ({ resident, onEdit, onView }) => {
  const age = calculateAge(resident.birthDate);
  const isCompulsoryAge = age >= 5 && age <= 16;
  const schoolInfo = resident.schoolInfo || {};

  // Determine school status
  let schoolStatus = 'GEEN_SCHOOL';
  if (age < 5) {
    schoolStatus = 'NIET_LEERPLICHTIG';
  } else if (schoolInfo.isAttendingSchool) {
    schoolStatus = 'SCHOOL';
  } else if (isCompulsoryAge) {
    schoolStatus = 'LEERPLICHTIG';
  }

  return (
    <tr className='hover:bg-gray-50 transition-colors'>
      <td className='px-6 py-4'>
        <div className='flex items-center space-x-3'>
          <img
            src={resident.photo}
            alt={resident.name}
            className='w-10 h-10 rounded-full object-cover'
          />
          <div>
            <p className='font-medium text-gray-900'>{resident.name}</p>
            <p className='text-sm text-gray-500'>{resident.nationality}</p>
          </div>
        </div>
      </td>
      <td className='px-6 py-4 text-sm text-gray-900'>{age || '-'} jaar</td>
      <td className='px-6 py-4'>
        <SchoolStatusBadge status={schoolStatus} />
      </td>
      <td className='px-6 py-4'>
        {schoolInfo.schoolType ? (
          <SchoolTypeBadge type={schoolInfo.schoolType} />
        ) : (
          <span className='text-sm text-gray-500'>-</span>
        )}
      </td>
      <td className='px-6 py-4'>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isCompulsoryAge
              ? 'bg-orange-100 text-orange-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isCompulsoryAge ? 'Ja' : 'Nee'}
        </span>
      </td>
      <td className='px-6 py-4'>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => onView(resident)}
            className='p-1 text-gray-400 hover:text-blue-600 transition-colors'
          >
            <Eye className='w-4 h-4' />
          </button>
          <button
            onClick={() => onEdit(resident)}
            className='p-1 text-gray-400 hover:text-green-600 transition-colors'
          >
            <Edit className='w-4 h-4' />
          </button>
        </div>
      </td>
    </tr>
  );
};

// 📈 School Distribution Chart Component
const SchoolDistributionChart = ({ schoolStats }) => (
  <div className='bg-white rounded-xl border border-gray-200 p-6'>
    <h3 className='text-lg font-semibold text-gray-900 mb-6'>
      Onderwijs Verdeling
    </h3>

    <div className='space-y-4'>
      {Object.entries(schoolStats.schoolTypes).map(([type, count]) => {
        const percentage =
          schoolStats.totalMinors > 0
            ? ((count / schoolStats.totalMinors) * 100).toFixed(1)
            : 0;

        const typeLabels = {
          BASIS: 'Basisschool',
          MIDDELBARE: 'Middelbare school',
          ISK: 'ISK',
          SPECIAAL: 'Speciaal onderwijs',
        };

        return (
          <div key={type} className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='font-medium text-gray-700'>
                {typeLabels[type]}
              </span>
              <span className='text-gray-600'>
                {count} ({percentage}%)
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// 🎯 Main SchoolTracker Component
const SchoolTracker = ({ residents = [], onEditResident, onViewResident }) => {
  const { locationType } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');

  // Filter residents by location and minors
  const locationResidents = useMemo(
    () => residents.filter((r) => r.locationType === locationType),
    [residents, locationType]
  );

  // Calculate school statistics
  const schoolStats = useMemo(() => {
    const minors = locationResidents.filter((r) => {
      const age = calculateAge(r.birthDate);
      return age !== null && age < 18;
    });

    const stats = {
      totalMinors: minors.length,
      totalAdults: locationResidents.length - minors.length,
      attending: 0,
      notAttending: 0,
      compulsoryAge: 0,
      notCompulsoryAge: 0,
      schoolTypes: {
        BASIS: 0,
        MIDDELBARE: 0,
        ISK: 0,
        SPECIAAL: 0,
      },
    };

    minors.forEach((resident) => {
      const age = calculateAge(resident.birthDate);
      const isCompulsoryAge = age >= 5 && age <= 16;
      const schoolInfo = resident.schoolInfo || {};

      if (isCompulsoryAge) {
        stats.compulsoryAge++;
      } else {
        stats.notCompulsoryAge++;
      }

      if (schoolInfo.isAttendingSchool) {
        stats.attending++;
        if (schoolInfo.schoolType) {
          stats.schoolTypes[schoolInfo.schoolType]++;
        }
      } else {
        stats.notAttending++;
      }
    });

    return stats;
  }, [locationResidents]);

  // Filter and search logic
  const filteredResidents = useMemo(() => {
    let filtered = locationResidents.filter((r) => {
      const age = calculateAge(r.birthDate);
      return age !== null && age < 18; // Only minors
    });

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.nationality.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => {
        const age = calculateAge(r.birthDate);
        const isCompulsoryAge = age >= 5 && age <= 16;
        const schoolInfo = r.schoolInfo || {};

        switch (statusFilter) {
          case 'attending':
            return schoolInfo.isAttendingSchool;
          case 'not_attending':
            return !schoolInfo.isAttendingSchool;
          case 'compulsory':
            return isCompulsoryAge;
          case 'not_compulsory':
            return !isCompulsoryAge;
          default:
            return true;
        }
      });
    }

    // Age filter
    if (ageFilter !== 'all') {
      filtered = filtered.filter((r) => {
        const age = calculateAge(r.birthDate);
        switch (ageFilter) {
          case '0-4':
            return age < 5;
          case '5-12':
            return age >= 5 && age <= 12;
          case '13-17':
            return age >= 13 && age <= 17;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [locationResidents, searchTerm, statusFilter, ageFilter]);

  return (
    <div className='space-y-6 p-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            🎓 School Tracker - {locationType === 'CNO' ? 'CNO' : 'Oekraïne'}
          </h1>
          <p className='text-gray-600 mt-1'>
            Overzicht van onderwijsdeelname en leerplichtige kinderen
          </p>
        </div>
        <div className='flex items-center space-x-3 mt-4 lg:mt-0'>
          <button
            onClick={() => exportAnalytics.school(residents, locationType)}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Download className='w-4 h-4 mr-2 inline' />
            Excel Export
          </button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <SchoolStatsCard
          title='Totaal Minderjarigen'
          value={schoolStats.totalMinors}
          subtitle='Onder 18 jaar'
          icon={Users}
          color='blue'
        />
        <SchoolStatsCard
          title='Op School'
          value={schoolStats.attending}
          subtitle='Volgen onderwijs'
          icon={CheckCircle}
          color='green'
          percentage={
            schoolStats.totalMinors > 0
              ? (
                  (schoolStats.attending / schoolStats.totalMinors) *
                  100
                ).toFixed(1)
              : 0
          }
        />
        <SchoolStatsCard
          title='Geen School'
          value={schoolStats.notAttending}
          subtitle='Volgen geen onderwijs'
          icon={XCircle}
          color='red'
          percentage={
            schoolStats.totalMinors > 0
              ? (
                  (schoolStats.notAttending / schoolStats.totalMinors) *
                  100
                ).toFixed(1)
              : 0
          }
        />
        <SchoolStatsCard
          title='Leerplichtige Leeftijd'
          value={schoolStats.compulsoryAge}
          subtitle='5-16 jaar'
          icon={AlertTriangle}
          color='orange'
          percentage={
            schoolStats.totalMinors > 0
              ? (
                  (schoolStats.compulsoryAge / schoolStats.totalMinors) *
                  100
                ).toFixed(1)
              : 0
          }
        />
      </div>

      {/* School Distribution Chart */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <SchoolDistributionChart schoolStats={schoolStats} />

        {/* Alerts and Notifications */}
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Aandachtspunten
          </h3>
          <div className='space-y-3'>
            {schoolStats.compulsoryAge > schoolStats.attending && (
              <div className='flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                <AlertTriangle className='w-5 h-5 text-orange-600 mr-3' />
                <div>
                  <p className='text-sm font-medium text-orange-800'>
                    Leerplichtige kinderen zonder school
                  </p>
                  <p className='text-sm text-orange-700'>
                    {schoolStats.compulsoryAge - schoolStats.attending} kinderen
                    van leerplicht leeftijd volgen geen onderwijs
                  </p>
                </div>
              </div>
            )}

            {schoolStats.notAttending > 0 && (
              <div className='flex items-center p-3 bg-red-50 border border-red-200 rounded-lg'>
                <XCircle className='w-5 h-5 text-red-600 mr-3' />
                <div>
                  <p className='text-sm font-medium text-red-800'>
                    Kinderen zonder onderwijs
                  </p>
                  <p className='text-sm text-red-700'>
                    {schoolStats.notAttending} kinderen volgen momenteel geen
                    onderwijs
                  </p>
                </div>
              </div>
            )}

            {schoolStats.attending === schoolStats.totalMinors &&
              schoolStats.totalMinors > 0 && (
                <div className='flex items-center p-3 bg-green-50 border border-green-200 rounded-lg'>
                  <CheckCircle className='w-5 h-5 text-green-600 mr-3' />
                  <div>
                    <p className='text-sm font-medium text-green-800'>
                      Alle kinderen op school
                    </p>
                    <p className='text-sm text-green-700'>
                      Alle minderjarige bewoners volgen onderwijs
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0'>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Zoek op naam of nationaliteit...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          <div className='flex items-center space-x-3'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>Alle statussen</option>
              <option value='attending'>Op school</option>
              <option value='not_attending'>Geen school</option>
              <option value='compulsory'>Leerplichtig</option>
              <option value='not_compulsory'>Niet leerplichtig</option>
            </select>

            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>Alle leeftijden</option>
              <option value='0-4'>0-4 jaar</option>
              <option value='5-12'>5-12 jaar</option>
              <option value='13-17'>13-17 jaar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Minderjarige Bewoners ({filteredResidents.length})
          </h3>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Bewoner
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Leeftijd
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  School Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  School Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Leerplichtig
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredResidents.map((resident) => (
                <StudentRow
                  key={resident.id}
                  resident={resident}
                  onEdit={onEditResident}
                  onView={onViewResident}
                />
              ))}
            </tbody>
          </table>

          {filteredResidents.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <GraduationCap className='w-12 h-12 mx-auto mb-4 text-gray-300' />
              <p>Geen minderjarige bewoners gevonden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolTracker;
