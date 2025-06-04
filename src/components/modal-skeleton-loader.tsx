import React from 'react';

const ModalSkeletonLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-11/12 max-w-xl h-3/4 sm:h-2/3 md:max-w-2xl lg:max-w-3xl bg-zinc-800 rounded-lg shadow-xl animate-pulse p-6">
        {/* Simulate header area */}
        <div className="h-1/3 bg-zinc-700 rounded mb-4"></div>
        {/* Simulate content lines */}
        <div className="h-6 bg-zinc-700 rounded w-3/4 mb-3"></div>
        <div className="h-6 bg-zinc-700 rounded w-1/2 mb-3"></div>
        <div className="h-6 bg-zinc-700 rounded w-5/6 mb-3"></div>
        <div className="h-6 bg-zinc-700 rounded w-2/3 mb-3"></div>
      </div>
    </div>
  );
};

export default ModalSkeletonLoader;
