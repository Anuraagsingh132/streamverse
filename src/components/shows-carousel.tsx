'use client';

import { useModalStore } from '@/stores/modal';
import { MediaType, type Show } from '@/types';
import { type WatchedItem } from '@/lib/localStorageUtils';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn, getNameFromShow, getSlug } from '@/lib/utils';
import { showPrefetchCache } from '@/lib/prefetch-cache';
import { usePathname, useRouter } from 'next/navigation';
import CustomImage from './custom-image';

interface ShowsCarouselProps {
  title: string;
  shows: (Show | WatchedItem)[];
}

const ShowsCarousel = ({ title, shows }: ShowsCarouselProps) => {
  const pathname = usePathname();

  const showsRef = React.useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);

  // handle scroll to left and right
  const scrollToDirection = (direction: 'left' | 'right') => {
    if (!showsRef.current) return;

    setIsScrollable(true);
    const { scrollLeft, offsetWidth } = showsRef.current;
    const handleSize = offsetWidth > 1400 ? 60 : 0.04 * offsetWidth;
    const offset =
      direction === 'left'
        ? scrollLeft - (offsetWidth - 2 * handleSize)
        : scrollLeft + (offsetWidth - 2 * handleSize);
    showsRef.current.scrollTo({ left: offset, behavior: 'smooth' });

    if (scrollLeft === 0 && direction === 'left') {
      showsRef.current.scrollTo({
        left: showsRef.current.scrollWidth,
        behavior: 'smooth',
      });
    } else if (
      scrollLeft + offsetWidth === showsRef.current.scrollWidth &&
      direction === 'right'
    ) {
      showsRef.current.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section aria-label="Carousel of shows" className="relative my-[3vw] p-0">
      {shows.length !== 0 && (
        <div className="space-y-1 sm:space-y-2.5">
          <h2 className="m-0 px-[4%] text-lg font-semibold text-foreground/80 transition-colors hover:text-foreground sm:text-xl 2xl:px-[60px]">
            {title ?? '-'}
          </h2>
          <div className="relative w-full items-center justify-center overflow-hidden">
            <Button
              aria-label="Scroll to left"
              variant="ghost"
              className={cn(
                'absolute left-0 top-0 z-10 mr-2 hidden h-full w-[4%] items-center justify-center rounded-l-none bg-transparent py-0 text-transparent hover:bg-secondary/90 hover:text-foreground md:block 2xl:w-[60px]',
                isScrollable ? 'md:block' : 'md:hidden',
              )}
              onClick={() => scrollToDirection('left')}>
              <Icons.chevronLeft className="h-8 w-8" aria-hidden="true" />
            </Button>
            <div
              ref={showsRef}
              className="no-scrollbar m-0 grid auto-cols-[calc(100%/3)] grid-flow-col overflow-x-auto overflow-y-hidden px-[4%] py-0 duration-500 ease-in-out sm:auto-cols-[25%] md:touch-pan-y lg:auto-cols-[20%] xl:auto-cols-[calc(100%/6)] 2xl:px-[60px]">
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} pathname={pathname} />
              ))}
            </div>
            <Button
              aria-label="Scroll to right"
              variant="ghost"
              className="absolute right-0 top-0 z-10 m-0 ml-2 hidden h-full w-[4%] items-center justify-center rounded-r-none bg-transparent py-0 text-transparent hover:bg-secondary/70 hover:text-foreground md:block 2xl:w-[60px]"
              onClick={() => scrollToDirection('right')}>
              <Icons.chevronRight className="h-8 w-8" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShowsCarousel;

export const ShowCard = ({ show }: { show: Show | WatchedItem; pathname: string }) => {
  const router = useRouter();
  const imageOnErrorHandler = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    event.currentTarget.src = '/images/grey-thumbnail.jpg';
  };

  const handleOpenModal = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('modal', show.id.toString());
    searchParams.set('type', show.media_type);
    router.push(`?${searchParams.toString()}`, { scroll: false });
  };

  const handlePrefetch = () => {
    if (show.id && show.media_type) {
      void showPrefetchCache.prefetch(show.id, show.media_type as MediaType);
    }
  };

  return (
    <div className="relative aspect-[2/3] px-1">
      <button
        type="button"
        className="relative block w-full h-full cursor-pointer rounded-lg overflow-hidden transition-all md:hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
        aria-label={`Open details for ${getNameFromShow(show)}`}
        onClick={handleOpenModal}
        onPointerEnter={handlePrefetch}
      >
        <CustomImage
          src={
            show.poster_path ?? show.backdrop_path
              ? `https://image.tmdb.org/t/p/w500${
                  show.poster_path ?? show.backdrop_path
                }`
              : '/images/grey-thumbnail.jpg'
          }
          alt={show.title ?? show.name ?? 'poster'}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 33vw"
          style={{
            objectFit: 'cover',
          }}
          onError={imageOnErrorHandler}
        />
        {show.media_type === MediaType.TV && (show as WatchedItem).seasonNumber && (show as WatchedItem).episodeNumber && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-center text-xs text-white">
            S{(show as WatchedItem).seasonNumber} E{(show as WatchedItem).episodeNumber}
          </div>
        )}
      </button>
    </div>
  );
};
