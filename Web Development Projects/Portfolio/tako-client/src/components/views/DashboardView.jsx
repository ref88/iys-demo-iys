import React, { memo } from 'react';
import { Users, Baby, Globe, Home } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics.ts';

const DashboardView = memo(({ residents }) => {
  const analytics = useAnalytics(residents);

  return (
    <div key='dashboard' className='view-transition p-6'>
      <h3 className='text-2xl font-bold mb-6 text-gray-900 dark:text-white'>
        Dashboard Overview
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-blue-600 dark:text-blue-400'>
                Totaal Bewoners
              </p>
              <p className='text-2xl font-bold text-blue-700 dark:text-blue-300'>
                {analytics.overview.totalResidents}
              </p>
            </div>
            <Users className='h-8 w-8 text-blue-600 dark:text-blue-400' />
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-purple-600 dark:text-purple-400'>
                Families
              </p>
              <p className='text-2xl font-bold text-purple-700 dark:text-purple-300'>
                {analytics.overview.families}
              </p>
            </div>
            <Home className='h-8 w-8 text-purple-600 dark:text-purple-400' />
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-green-600 dark:text-green-400'>
                Kinderen
              </p>
              <p className='text-2xl font-bold text-green-700 dark:text-green-300'>
                {analytics.overview.children}
              </p>
            </div>
            <Baby className='h-8 w-8 text-green-600 dark:text-green-400' />
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-orange-600 dark:text-orange-400'>
                Individuelen
              </p>
              <p className='text-2xl font-bold text-orange-700 dark:text-orange-300'>
                {analytics.overview.individuals}
              </p>
            </div>
            <Globe className='h-8 w-8 text-orange-600 dark:text-orange-400' />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
          <h4 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
            Capaciteit
          </h4>
          <div className='space-y-4'>
            <div className='flex justify-between'>
              <span className='text-gray-700 dark:text-gray-300'>
                Huidige bezetting:
              </span>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {analytics.capacity.currentOccupancy}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-700 dark:text-gray-300'>
                Totale capaciteit:
              </span>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {analytics.capacity.totalCapacity}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-700 dark:text-gray-300'>
                Bezettingsgraad:
              </span>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {analytics.capacity.occupancyRate.toFixed(1)}%
              </span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${analytics.capacity.occupancyRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
          <h4 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
            Recente Activiteit
          </h4>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-gray-700 dark:text-gray-300'>
                Nieuwe bewoners (30 dagen):
              </span>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {analytics.overview.recentRegistrations}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-700 dark:text-gray-300'>
                Gemiddelde leeftijd:
              </span>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {analytics.overview.averageAge} jaar
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-700 dark:text-gray-300'>
                Noodcontacten:
              </span>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {analytics.overview.emergencyContacts}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-700 dark:text-gray-300'>
                Documenten:
              </span>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {analytics.overview.documentsCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
          <h4 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
            Geslachtsverdeling
          </h4>
          <div className='space-y-2'>
            {Object.entries(analytics.distributions.gender).map(
              ([gender, count]) => (
                <div key={gender} className='flex justify-between'>
                  <span className='text-gray-700 dark:text-gray-300'>
                    {gender === 'M'
                      ? 'Man'
                      : gender === 'V'
                        ? 'Vrouw'
                        : 'Onbekend'}
                    :
                  </span>
                  <span className='font-semibold text-gray-900 dark:text-white'>
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
          <h4 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
            Leeftijdsgroepen
          </h4>
          <div className='space-y-2'>
            {Object.entries(analytics.distributions.ageGroups).map(
              ([group, count]) => (
                <div key={group} className='flex justify-between'>
                  <span className='text-gray-700 dark:text-gray-300'>
                    {group}:
                  </span>
                  <span className='font-semibold text-gray-900 dark:text-white'>
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
          <h4 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
            Nationaliteiten
          </h4>
          <div className='space-y-2'>
            {Object.entries(analytics.distributions.nationality)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([nationality, count]) => (
                <div key={nationality} className='flex justify-between'>
                  <span className='text-gray-700 dark:text-gray-300'>
                    {nationality}:
                  </span>
                  <span className='font-semibold text-gray-900 dark:text-white'>
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
});

DashboardView.displayName = 'DashboardView';

export default DashboardView;
