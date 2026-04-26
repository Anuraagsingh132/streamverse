'use client';

import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Show } from '@/types';
import { MediaType } from '@/types/index';
import ShowsGrid from '@/components/shows-grid';
import { useSearchStore } from '@/stores/search';
import { useModalStore } from '@/stores/modal';
import { handleDefaultSearchBtn, handleDefaultSearchInp } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { showPrefetchCache } from '@/lib/prefetch-cache';

// Lazy load modal components
const DesktopShowModal = lazy(() => import('@/components/shows-modal'));
const MobileShowModal = lazy(() => import('@/components/shows-modal-mobile'));
const ModalSkeletonLoader = lazy(() => import('@/components/modal-skeleton-loader'));

interface SearchContainerProps {
  query: string;
  shows: Show[];
}

function SearchContainer({ shows, query }: SearchContainerProps) {
  const searchStore = useSearchStore();
  const modalStore = useModalStore();
  const searchParams = useSearchParams();
  const modalParam = searchParams.get('modal');
  const typeParam = searchParams.get('type') as MediaType | null;

  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);
  const [activeShow, setActiveShow] = useState<Show | null>(null);

  // Hydrate the search store on mount
  React.useEffect(() => {
    searchStore.setOpen(true);
    searchStore.setQuery(query);
    searchStore.setShows(shows);
    const timer1: NodeJS.Timeout = setTimeout(() => {
      handleDefaultSearchBtn();
    }, 5);
    const timer2: NodeJS.Timeout = setTimeout(() => {
      handleDefaultSearchInp();
    }, 10);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Device detection for mobile vs desktop modal
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

  // Listen for ?modal=ID&type=TYPE URL params — check prefetch cache first
  useEffect(() => {
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

  return (
    <>
      {/* Modal rendering */}
      {activeShow && isMobileDevice === null && (
        <ModalSkeletonLoader />
      )}
      {activeShow && isMobileDevice !== null && (
        <Suspense fallback={<ModalSkeletonLoader />}>
          {isMobileDevice ? <MobileShowModal show={activeShow} /> : <DesktopShowModal show={activeShow} />}
        </Suspense>
      )}

      {/* Search results grid */}
      <ShowsGrid shows={searchStore.shows} query={searchStore.query} />
    </>
  );
}

export default SearchContainer;
