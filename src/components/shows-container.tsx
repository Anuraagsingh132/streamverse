'use client';

import { usePathname, useSearchParams } from 'next/navigation';
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
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { type Show, MediaType } from '@/types/index';

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

const ShowsContainerInner = ({ shows }: ShowsContainerProps) => {
  const searchParams = useSearchParams();
  const modalParam = searchParams.get('modal');
  const typeParam = searchParams.get('type') as MediaType | null;

  const modalStore = useModalStore(); // Only needed for play/currentlyPlayingEpisodeId
  const searchStore = useSearchStore();

  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);
  const [activeShow, setActiveShow] = useState<Show | null>(null);

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
    if (modalParam) {
      if (!activeShow || activeShow.id.toString() !== modalParam) {
        const movieId = parseInt(modalParam);
        if (!movieId) return;
        const fetchAndOpen = async () => {
          try {
            const response =
              typeParam === MediaType.TV
                ? await MovieService.findTvSeries(movieId)
                : await MovieService.findMovie(movieId);
            const data = response.data;
            if (data) {
              setActiveShow({ ...data, media_type: typeParam || data.media_type });
              useModalStore.setState({ play: true }); // trigger autoplay when modal opens
            }
          } catch (error) {
            console.error('Failed to load modal data', error);
          }
        };
        void fetchAndOpen();
      }
    } else {
      if (activeShow) {
        setActiveShow(null);
        modalStore.reset();
      }
    }
  }, [modalParam, typeParam]);

  return (
    <>
      {activeShow && isMobileDevice === null && (
        <ModalSkeletonLoader />
      )}
      {activeShow && isMobileDevice !== null && (
        <Suspense fallback={<ModalSkeletonLoader />}>
          {isMobileDevice ? <MobileShowModal show={activeShow} /> : <DesktopShowModal show={activeShow} />}
        </Suspense>
      )}
      
      {searchStore.query.length > 0 ? (
        <ShowsGrid shows={searchStore.shows} query={searchStore.query} />
      ) : (
        shows.map(
          (item) =>
            item.visible && (
              <LazyCarouselWrapper key={item.title} item={item} />
            ),
        )
      )}
    </>
  );
};

const LazyCarouselWrapper = ({ item }: { item: CategorizedShows }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(ref, { rootMargin: '400px 0px' });

  return (
    <div ref={ref} className="min-h-[250px]">
      {isIntersecting ? (
        <ShowsCarousel title={item.title} shows={item.shows ?? []} />
      ) : null}
    </div>
  );
};

const ShowsContainer = ({ shows }: ShowsContainerProps) => {
  return (
    <Suspense fallback={null}>
      <ShowsContainerInner shows={shows} />
    </Suspense>
  );
};

export default ShowsContainer;
