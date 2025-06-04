'use client';

import { usePathname } from 'next/navigation';
// import { useMounted } from '@/hooks/use-mounted';
// import { useModalStore } from "@/stores/modal"
// import { useProfileStore } from "@/stores/profile"
import { useSearchStore } from '@/stores/search';
import type { CategorizedShows } from '@/types';

// import { api } from "@/lib/api/api"
import { getIdFromSlug } from '@/lib/utils'; // Removed getMobileDetect
// import ShowModal from '@/components/shows-modal'; // Removed direct import
import ShowsCarousel from '@/components/shows-carousel';
import ShowsGrid from '@/components/shows-grid';
// import ShowsSkeleton from '@/components/shows-skeleton';
import { useModalStore } from '@/stores/modal';
import React, { useEffect, useState, lazy, Suspense } from 'react'; // Added hooks and lazy/Suspense
import { type Show } from '@/types/index';

// Lazy load modal components
const DesktopShowModal = lazy(() => import('@/components/shows-modal'));
const MobileShowModal = lazy(() => import('@/components/shows-modal-mobile'));
const ModalSkeletonLoader = lazy(() => import('@/components/modal-skeleton-loader')); // Import skeleton loader
import { type AxiosResponse } from 'axios';
import MovieService from '@/services/MovieService';

interface ShowsContainerProps {
  show?: Show;
  shows: CategorizedShows[];
}

const ShowsContainer = ({ shows }: ShowsContainerProps) => {
  // const mounted = useMounted();
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

  React.useEffect(() => {
    void handleOpenModal();
  }, []);

  const handleOpenModal = async (): Promise<void> => {
    if (!/\d/.test(pathname) || modalStore.open) {
      return;
    }
    const movieId: number = getIdFromSlug(pathname);
    if (!movieId) {
      return;
    }
    try {
      const response: AxiosResponse<Show> = pathname.includes('/tv-shows')
        ? await MovieService.findTvSeries(movieId)
        : await MovieService.findMovie(movieId);
      const data: Show = response.data;
      if (data)
        useModalStore.setState({
          show: data,
          open: true,
          play: true,
          firstLoad: true,
        });
    } catch (error) {}
  };

  // if (!mounted) {
  //   return (
  //     <div className="mt-4 min-h-[800px] pt-[5%]">
  //       <ShowsSkeleton />
  //     </div>
  //   );
  // }

  if (searchStore.query.length > 0) {
    return <ShowsGrid shows={searchStore.shows} query={searchStore.query} />;
  }

  return (
    <>
      {modalStore.open && (
        <Suspense fallback={<ModalSkeletonLoader />}>
          {isMobileDevice ? <MobileShowModal /> : <DesktopShowModal />}
        </Suspense>
      )}
      {shows.map(
        (item) =>
          item.visible && (
            <ShowsCarousel
              key={item.title}
              title={item.title}
              shows={item.shows ?? []}
            />
          ),
      )}
    </>
  );
};

export default ShowsContainer;
