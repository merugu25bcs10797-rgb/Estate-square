import React from 'react';

export const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-warm-200 overflow-hidden shadow-sm animate-pulse">
      {/* 4:3 Image ratio placeholder */}
      <div className="aspect-4/3 bg-warm-200 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-warm-200 rounded w-1/3" />
          <div className="h-4 bg-warm-200 rounded w-1/4" />
        </div>
        <div className="h-4 bg-warm-200 rounded w-3/4" />
        <div className="h-3 bg-warm-200 rounded w-1/2" />
        <div className="pt-2 border-t border-warm-100 flex justify-between">
          <div className="h-3 bg-warm-200 rounded w-1/4" />
          <div className="h-3 bg-warm-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const PropertyGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default PropertyCardSkeleton;
