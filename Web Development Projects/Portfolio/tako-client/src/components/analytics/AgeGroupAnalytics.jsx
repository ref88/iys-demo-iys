import React, { useState, useMemo } from 'react';
import {
  Users,
  Baby,
  GraduationCap,
  User,
  UserCheck,
  BarChart3,
  PieChart,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { exportAnalytics } from '../../utils/excelExport.js';
import { calculateAge } from '../../utils/dateUtils.js';

// 📊 Age Group Card Component
const AgeGroupCard = ({
  title,
  ageRange,
  male,
  female,
  total,
  icon: Icon,
  color = 'blue',
  percentage,
  onClick,
  isExpanded = false,
}) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 ${
      onClick ? 'cursor-pointer' : ''
    }`}
    onClick={onClick}
    onKeyDown={(e) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    }}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    <div className='flex items-center justify-between mb-4'>
      <div className='flex items-center space-x-3'>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
          <p className='text-sm text-gray-500'>{ageRange}</p>
        </div>
      </div>
      <div className='text-right'>
        <div className='text-2xl font-bold text-gray-900'>{total}</div>
        <div className='text-sm text-gray-500'>{percentage}%</div>
      </div>
    </div>

    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <div className='w-3 h-3 bg-blue-500 rounded-full' />
          <span className='text-sm font-medium text-gray-700'>Man</span>
        </div>
        <span className='text-sm font-semibold text-gray-900'>{male}</span>
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <div className='w-3 h-3 bg-pink-500 rounded-full' />
          <span className='text-sm font-medium text-gray-700'>Vrouw</span>
        </div>
        <span className='text-sm font-semibold text-gray-900'>{female}</span>
      </div>

      {/* Progress bar */}
      <div className='w-full bg-gray-200 rounded-full h-2 mt-3'>
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>

    {isExpanded && onClick && (
      <div className='mt-4 pt-4 border-t border-gray-200'>
        {onClick ? (
          <ChevronUp className='w-4 h-4 text-gray-400' />
        ) : (
          <ChevronDown className='w-4 h-4 text-gray-400' />
        )}
      </div>
    )}
  </div>
);

// 📈 Age Distribution Chart Component
const AgeDistributionChart = ({ ageGroups, totalResidents }) => (
  <div className='bg-white rounded-xl border border-gray-200 p-6'>
    <div className='flex items-center justify-between mb-6'>
      <h3 className='text-lg font-semibold text-gray-900'>
        Leeftijdsverdeling Overzicht
      </h3>
      <div className='flex items-center space-x-2'>
        <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
          <BarChart3 className='w-4 h-4' />
        </button>
        <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
          <PieChart className='w-4 h-4' />
        </button>
      </div>
    </div>

    <div className='space-y-4'>
      {Object.entries(ageGroups).map(([group, data]) => {
        const percentage =
          totalResidents > 0
            ? ((data.total / totalResidents) * 100).toFixed(1)
            : 0;
        return (
          <div key={group} className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='font-medium text-gray-700'>{group} jaar</span>
              <span className='text-gray-600'>
                {data.total} ({percentage}%)
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className='bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300'
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className='flex justify-between text-xs text-gray-500'>
              <span>♂ {data.male}</span>
              <span>♀ {data.female}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// 🎯 Gender Distribution Component
const GenderDistribution = ({ residents }) => {
  const genderStats = useMemo(() => {
    const male = residents.filter((r) => r.gender === 'M').length;
    const female = residents.filter((r) => r.gender === 'V').length;
    const total = residents.length;

    return {
      male,
      female,
      total,
      malePercentage: total > 0 ? ((male / total) * 100).toFixed(1) : 0,
      femalePercentage: total > 0 ? ((female / total) * 100).toFixed(1) : 0,
    };
  }, [residents]);

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-6'>
        Geslachtsverdeling
      </h3>

      <div className='grid grid-cols-2 gap-6'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <User className='w-8 h-8 text-blue-600' />
          </div>
          <div className='text-2xl font-bold text-gray-900'>
            {genderStats.male}
          </div>
          <div className='text-sm text-gray-500'>
            Man ({genderStats.malePercentage}%)
          </div>
        </div>

        <div className='text-center'>
          <div className='w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <User className='w-8 h-8 text-pink-600' />
          </div>
          <div className='text-2xl font-bold text-gray-900'>
            {genderStats.female}
          </div>
          <div className='text-sm text-gray-500'>
            Vrouw ({genderStats.femalePercentage}%)
          </div>
        </div>
      </div>

      <div className='mt-6 flex rounded-lg overflow-hidden'>
        <div
          className='bg-blue-500 h-2 transition-all duration-300'
          style={{ width: `${genderStats.malePercentage}%` }}
        />
        <div
          className='bg-pink-500 h-2 transition-all duration-300'
          style={{ width: `${genderStats.femalePercentage}%` }}
        />
      </div>
    </div>
  );
};

// 📊 Age Statistics Summary
const AgeStatsSummary = ({ residents }) => {
  const ageStats = useMemo(() => {
    const ages = residents
      .map((r) => calculateAge(r.birthDate))
      .filter((age) => age !== null);

    if (ages.length === 0) {
      return { min: 0, max: 0, avg: 0, median: 0 };
    }

    const sortedAges = [...ages].sort((a, b) => a - b);
    const min = sortedAges[0];
    const max = sortedAges[sortedAges.length - 1];
    const avg = Math.round(
      ages.reduce((sum, age) => sum + age, 0) / ages.length
    );
    const median =
      sortedAges.length % 2 === 0
        ? Math.round(
            (sortedAges[sortedAges.length / 2 - 1] +
              sortedAges[sortedAges.length / 2]) /
              2
          )
        : sortedAges[Math.floor(sortedAges.length / 2)];

    return { min, max, avg, median };
  }, [residents]);

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-6'>
        Leeftijd Statistieken
      </h3>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-600'>{ageStats.min}</div>
          <div className='text-sm text-gray-500'>Jongste</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-green-600'>
            {ageStats.max}
          </div>
          <div className='text-sm text-gray-500'>Oudste</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-purple-600'>
            {ageStats.avg}
          </div>
          <div className='text-sm text-gray-500'>Gemiddeld</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-orange-600'>
            {ageStats.median}
          </div>
          <div className='text-sm text-gray-500'>Mediaan</div>
        </div>
      </div>
    </div>
  );
};

// 🎯 Main AgeGroupAnalytics Component
const AgeGroupAnalytics = ({ residents = [] }) => {
  const { locationType } = useLocation();
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'chart'

  // Filter residents by location
  const locationResidents = useMemo(
    () => residents.filter((r) => r.locationType === locationType),
    [residents, locationType]
  );

  // Calculate age groups with gender breakdown
  const ageGroups = useMemo(() => {
    const groups = {
      '0-4': { male: 0, female: 0, total: 0 },
      '4-12': { male: 0, female: 0, total: 0 },
      '12-18': { male: 0, female: 0, total: 0 },
      '18-64': { male: 0, female: 0, total: 0 },
      '65+': { male: 0, female: 0, total: 0 },
    };

    locationResidents.forEach((resident) => {
      const age = calculateAge(resident.birthDate);
      if (age !== null) {
        let group;
        if (age < 4) {
          group = '0-4';
        } else if (age < 12) {
          group = '4-12';
        } else if (age < 18) {
          group = '12-18';
        } else if (age < 65) {
          group = '18-64';
        } else {
          group = '65+';
        }

        groups[group].total++;
        if (resident.gender === 'M') {
          groups[group].male++;
        } else {
          groups[group].female++;
        }
      }
    });

    return groups;
  }, [locationResidents]);

  const totalResidents = locationResidents.length;

  // Age group configuration
  const ageGroupConfig = [
    {
      key: '0-4',
      title: 'Peuters & Kleuters',
      range: '0-4 jaar',
      icon: Baby,
      color: 'pink',
    },
    {
      key: '4-12',
      title: 'Basisschool',
      range: '4-12 jaar',
      icon: GraduationCap,
      color: 'blue',
    },
    {
      key: '12-18',
      title: 'Middelbare School',
      range: '12-18 jaar',
      icon: User,
      color: 'green',
    },
    {
      key: '18-64',
      title: 'Volwassenen',
      range: '18-64 jaar',
      icon: UserCheck,
      color: 'purple',
    },
    {
      key: '65+',
      title: 'Senioren',
      range: '65+ jaar',
      icon: UserCheck,
      color: 'orange',
    },
  ];

  return (
    <div className='space-y-6 p-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            👥 Leeftijdsgroepen - {locationType === 'CNO' ? 'CNO' : 'Oekraïne'}
          </h1>
          <p className='text-gray-600 mt-1'>
            Gedetailleerde analyse van leeftijdsverdeling en geslacht
          </p>
        </div>
        <div className='flex items-center space-x-3 mt-4 lg:mt-0'>
          <div className='flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200'>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className='w-4 h-4 mr-1 inline' />
              Kaarten
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'chart'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className='w-4 h-4 mr-1 inline' />
              Grafiek
            </button>
          </div>
          <button
            onClick={() => exportAnalytics.ageGroups(residents, locationType)}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Download className='w-4 h-4 mr-2 inline' />
            Excel Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>
                Totaal Bewoners
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {totalResidents}
              </p>
              <p className='text-sm text-gray-500'>Alle leeftijdsgroepen</p>
            </div>
            <div className='p-3 bg-blue-100 rounded-lg'>
              <Users className='w-6 h-6 text-blue-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Minderjarigen</p>
              <p className='text-2xl font-bold text-gray-900'>
                {ageGroups['0-4'].total +
                  ageGroups['4-12'].total +
                  ageGroups['12-18'].total}
              </p>
              <p className='text-sm text-gray-500'>Onder 18 jaar</p>
            </div>
            <div className='p-3 bg-green-100 rounded-lg'>
              <Baby className='w-6 h-6 text-green-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Volwassenen</p>
              <p className='text-2xl font-bold text-gray-900'>
                {ageGroups['18-64'].total}
              </p>
              <p className='text-sm text-gray-500'>18-64 jaar</p>
            </div>
            <div className='p-3 bg-purple-100 rounded-lg'>
              <UserCheck className='w-6 h-6 text-purple-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Senioren</p>
              <p className='text-2xl font-bold text-gray-900'>
                {ageGroups['65+'].total}
              </p>
              <p className='text-sm text-gray-500'>65 jaar en ouder</p>
            </div>
            <div className='p-3 bg-orange-100 rounded-lg'>
              <UserCheck className='w-6 h-6 text-orange-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Age Group Cards or Chart */}
      {viewMode === 'cards' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'>
          {ageGroupConfig.map((config) => {
            const groupData = ageGroups[config.key];
            const percentage =
              totalResidents > 0
                ? ((groupData.total / totalResidents) * 100).toFixed(1)
                : 0;

            return (
              <AgeGroupCard
                key={config.key}
                title={config.title}
                ageRange={config.range}
                male={groupData.male}
                female={groupData.female}
                total={groupData.total}
                icon={config.icon}
                color={config.color}
                percentage={percentage}
                onClick={() =>
                  setExpandedGroup(
                    expandedGroup === config.key ? null : config.key
                  )
                }
                isExpanded={expandedGroup === config.key}
              />
            );
          })}
        </div>
      ) : (
        <AgeDistributionChart
          ageGroups={ageGroups}
          totalResidents={totalResidents}
        />
      )}

      {/* Additional Analytics */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <GenderDistribution residents={locationResidents} />
        <AgeStatsSummary residents={locationResidents} />
      </div>
    </div>
  );
};

export default AgeGroupAnalytics;
