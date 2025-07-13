import React from 'react';

// 🎨 ADVANCED LOADING SKELETON SYSTEM
// Professional, calm loading states for each view type

export const DashboardSkeleton = () => (
  <div className='space-y-6 p-6 animate-pulse'>
    {/* Header skeleton */}
    <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6' />

    {/* Stats cards skeleton */}
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
        >
          <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3' />
          <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4' />
        </div>
      ))}
    </div>

    {/* Charts skeleton */}
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
        <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4' />
        <div className='h-64 bg-gray-100 dark:bg-gray-900 rounded' />
      </div>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
        <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4' />
        <div className='h-64 bg-gray-100 dark:bg-gray-900 rounded' />
      </div>
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse'>
    {/* Header */}
    <div className='flex justify-between items-center mb-6'>
      <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4' />
      <div className='h-10 bg-blue-100 dark:bg-blue-900 rounded w-32' />
    </div>

    {/* Search and filters */}
    <div className='flex gap-4 mb-6'>
      <div className='h-10 bg-gray-100 dark:bg-gray-900 rounded flex-1' />
      <div className='h-10 bg-gray-100 dark:bg-gray-900 rounded w-40' />
      <div className='h-10 bg-gray-100 dark:bg-gray-900 rounded w-40' />
    </div>

    {/* Table rows */}
    <div className='space-y-3'>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className='flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded'
        >
          <div className='h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3' />
            <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4' />
          </div>
          <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-20' />
        </div>
      ))}
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse'>
    <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6' />
    <div className='space-y-6'>
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2' />
          <div className='h-10 bg-gray-100 dark:bg-gray-900 rounded' />
        </div>
      ))}
      <div className='flex gap-4 mt-8'>
        <div className='h-10 bg-blue-100 dark:bg-blue-900 rounded flex-1' />
        <div className='h-10 bg-gray-100 dark:bg-gray-900 rounded flex-1' />
      </div>
    </div>
  </div>
);

export const CardGridSkeleton = () => (
  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 animate-pulse'>
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
      >
        <div className='flex items-center space-x-4 mb-4'>
          <div className='h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full' />
          <div className='flex-1'>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2' />
            <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2' />
          </div>
        </div>
        <div className='space-y-2'>
          <div className='h-3 bg-gray-100 dark:bg-gray-900 rounded' />
          <div className='h-3 bg-gray-100 dark:bg-gray-900 rounded w-5/6' />
        </div>
      </div>
    ))}
  </div>
);

export const ModalSkeleton = () => (
  <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 animate-fadeIn'>
    <div className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl p-6 animate-pulse'>
      <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4' />
      <div className='space-y-4'>
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2' />
            <div className='h-10 bg-gray-100 dark:bg-gray-900 rounded' />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Intelligent skeleton selector based on view type
export const getSkeletonForView = (viewType) => {
  const skeletons = {
    dashboard: DashboardSkeleton,
    residents: TableSkeleton,
    handover: TableSkeleton,
    incidents: TableSkeleton,
    leaves: TableSkeleton,
    audit: TableSkeleton,
    labels: CardGridSkeleton,
    form: FormSkeleton,
    modal: ModalSkeleton,
  };

  const SkeletonComponent = skeletons[viewType] || DashboardSkeleton;
  return <SkeletonComponent />;
};
