'use client';

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useModalStore } from '@/stores/modal';
import type { Show } from '@/types';
// import ShowModal from './shows-modal'; // Removed direct import
import { ShowCard } from './shows-carousel';
import { usePathname } from 'next/navigation';
import { useSearchStore } from '@/stores/search';
import ShowsSkeleton from './shows-skeleton';
import { cn } from '@/lib/utils';
// import { getMobileDetect } from '@/lib/utils'; // Removed as aspect ratio is now used

// Lazy load modal components
const DesktopShowModal = lazy(() => import('./shows-modal'));
const MobileShowModal = lazy(() => import('./shows-modal-mobile'));
const ModalSkeletonLoader = lazy(() => import('./modal-skeleton-loader')); // Import skeleton loader

interface SearchedShowsProps {
  shows: Show[];
  query?: string;
}

const ShowsGrid = ({ shows, query }: SearchedShowsProps) => {
  const pathname = usePathname();
  const modalStore = useModalStore();
  const searchStore = useSearchStore();

  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkDeviceType = () => {
      if (typeof window !== 'undefined') {
        const aspectRatio = window.innerWidth / window.innerHeight;
        setIsMobileDevice(aspectRatio < 0.75);
      }
    };

    checkDeviceType(); // Check on initial mount
    window.addEventListener('resize', checkDeviceType); // Check on resize

    return () => {
      window.removeEventListener('resize', checkDeviceType); // Cleanup listener
    };
  }, []);

  return (
    <section aria-label="Grid of shows" className="container w-full max-w-none">
      {modalStore.open && (
        <Suspense fallback={<ModalSkeletonLoader />}>
          {isMobileDevice ? <MobileShowModal /> : <DesktopShowModal />}
        </Suspense>
      )}
      <div className="main-view mt-4 min-h-[800px] pt-[5%]" id="main-view">
        {query && searchStore.loading ? (
          <ShowsSkeleton classname="pl-0" />
        ) : query && !shows?.length ? (
          <div className="text-center">
            <div className="inline-block text-left text-sm">
              <p className="mb-4">{`Your search for "${query}" did not have any matches.`}</p>
              <p className="mb-4">Suggestions:</p>
              <ul className="list-disc pl-8">
                <li>Try different keywords</li>
                <li>Looking for a movie or TV show?</li>
                <li>Try using a movie, TV show title, an actor or director</li>
                <li>Try a genre, like comedy, romance, sports, or drama</li>
              </ul>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'xxs:grid-cols-2 xxs:gap-x-1.5 xxs:gap-y-5 grid gap-y-3.5 xs:grid-cols-3 xs:gap-y-7 sm:grid-cols-3 sm:gap-y-10 md:grid-cols-4 md:gap-y-12 lg:gap-y-14 xl:grid-cols-6 xl:gap-y-16',
              query && 'max-sm:grid-cols-3 max-[375px]:grid-cols-2',
            )}>
            {shows.map((show: Show) => (
              <ShowCard key={show.id} show={show} pathname={pathname} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShowsGrid;
