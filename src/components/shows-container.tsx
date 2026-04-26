'use client';

import { useSearchParams } from 'next/navigation';
import { useSearchStore } from '@/stores/search';
import type { CategorizedShows } from '@/types';
import ShowsCarousel from '@/components/shows-carousel';
import ShowsGrid from '@/components/shows-grid';
import { useModalStore } from '@/stores/modal';
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { type Show, MediaType } from '@/types/index';
import { showPrefetchCache } from '@/lib/prefetch-cache';
import MovieService from '@/services/MovieService';

// Lazy load modal components
const DesktopShowModal = lazy(() => import('@/components/shows-modal'));
const MobileShowModal = lazy(() => import('@/components/shows-modal-mobile'));
const ModalSkeletonLoader = lazy(() => import('@/components/modal-skeleton-loader'));

interface ShowsContainerProps {
  show?: Show;
  shows: CategorizedShows[];
}

const ShowsContainerInner = ({ shows }: ShowsContainerProps) => {
  const searchParams = useSearchParams();
  const modalParam = searchParams.get('modal');
  const typeParam = searchParams.get('type') as MediaType | null;

  const modalStore = useModalStore();
  const searchStore = useSearchStore();

  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);
  const [activeShow, setActiveShow] = useState<Show | null>(null);

  // Device detection
  useEffect(() => {
    const checkDeviceType = () => {
      if (typeof window !== 'undefined') {
        const aspectRatio = window.innerWidth / window.innerHeight;
        setIsMobileDevice(aspectRatio < 0.75);
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Modal opening: check prefetch cache first, then network
  React.useEffect(() => {
    if (modalParam) {
      if (!activeShow || activeShow.id.toString() !== modalParam) {
        const movieId = parseInt(modalParam);
        if (!movieId) return;
        const mediaType = typeParam || MediaType.MOVIE;

        // Check the prefetch cache first for instant opening
        const cached = showPrefetchCache.get(movieId, mediaType);
        if (cached) {
          setActiveShow(cached);
          useModalStore.setState({ play: true });
          return;
        }

        // Cache miss: fetch from network
        const fetchAndOpen = async () => {
          try {
            const response =
              mediaType === MediaType.TV
                ? await MovieService.findTvSeries(movieId)
                : await MovieService.findMovie(movieId);
            const data = response.data;
            if (data) {
              const show = { ...data, media_type: mediaType };
              setActiveShow(show);
              useModalStore.setState({ play: true });
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

  // Background prefetch: after mount, batch-prefetch all shows during idle time
  useEffect(() => {
    const allShows = shows
      .filter((cat) => cat.visible && cat.shows?.length)
      .flatMap((cat) =>
        (cat.shows ?? []).map((s) => ({
          id: s.id,
          media_type: s.media_type as MediaType,
        })),
      );

    // Deduplicate by id+type
    const seen = new Set<string>();
    const unique = allShows.filter((s) => {
      const key = `${s.id}-${s.media_type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Start prefetching after a delay to let images load first
    const timer = setTimeout(() => {
      showPrefetchCache.prefetchBatch(unique);
    }, 4000);

    return () => clearTimeout(timer);
  }, [shows]);

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

