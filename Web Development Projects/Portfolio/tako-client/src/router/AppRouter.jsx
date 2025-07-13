import React, { lazy, Suspense } from 'react';

// 🚀 SIMPLE LAZY LOADING APPROACH
// For immediate bundle size benefits without changing your existing structure

// Lazy load the main VMS component
const VMSRefactored = lazy(
  () => import('../components/features/VMSRefactored.jsx')
);

// 🎨 ADVANCED LOADING SKELETON SYSTEM
const LoadingSkeleton = ({ type = 'dashboard' }) => {
  const skeletons = {
    dashboard: (
      <div className='space-y-6 p-6 animate-pulse'>
        {/* Header skeleton */}
        <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6' />

        {/* Stats cards skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='h-24 bg-gray-200 dark:bg-gray-700 rounded-lg'
            />
          ))}
        </div>

        {/* Main content skeleton */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='h-64 bg-gray-200 dark:bg-gray-700 rounded-lg' />
          <div className='h-64 bg-gray-200 dark:bg-gray-700 rounded-lg' />
        </div>
      </div>
    ),

    table: (
      <div className='space-y-4 p-6 animate-pulse'>
        <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4' />
        <div className='space-y-3'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='h-12 bg-gray-200 dark:bg-gray-700 rounded'
            />
          ))}
        </div>
      </div>
    ),

    form: (
      <div className='space-y-6 p-6 animate-pulse'>
        <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6' />
        <div className='space-y-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2' />
              <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded' />
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return skeletons[type] || skeletons.dashboard;
};

// 🎯 SIMPLE BUT EFFECTIVE APPROACH
// This gives immediate bundle optimization while maintaining your existing routing

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingSkeleton type='dashboard' />}>
      <VMSRefactored />
    </Suspense>
  );
};

export default AppRouter;
