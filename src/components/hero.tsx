'use client';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { getIdFromSlug } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { useModalStore } from '@/stores/modal';
import { useSearchStore } from '@/stores/search';
import { MediaType, type Show } from '@/types';
import { type AxiosResponse } from 'axios';
import Link from 'next/link';
import React from 'react';
import CustomImage from './custom-image';


interface HeroProps {
  featuredShows: Show[];
}

const Hero = ({ featuredShows }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const modalStore = useModalStore();
  const searchStore = useSearchStore();

  React.useEffect(() => {
    // Ensure featuredShows is valid and has enough items to rotate
    if (!Array.isArray(featuredShows) || featuredShows.length <= 1) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredShows.length);
      // setIsVideoReady(false); // Video removed
    }, 30000); // Rotate every 30 seconds

    return () => clearTimeout(timer);
  }, [currentIndex, featuredShows]); // Depend on featuredShows directly

  // The popstate event handler for modal restoration can remain largely the same,
  // as it's triggered by URL changes when a modal is opened, not by hero slide changes.

  React.useEffect(() => {
    window.addEventListener('popstate', handlePopstateEvent, false);
    return () => {
      window.removeEventListener('popstate', handlePopstateEvent, false);
    };
  }, []);

  const handlePopstateEvent = () => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    if (typeof pathname !== 'string') {
      console.error('Hero: pathname is not a string or is unexpectedly undefined/null after initial assignment:', pathname);
      modalStore.reset(); // Optional: reset modal state or handle error appropriately
      return; 
    }
    if (!/\d/.test(pathname)) {
      modalStore.reset();
    } else if (/\d/.test(pathname)) {
      const movieId: number = getIdFromSlug(pathname);
      if (!movieId) {
        return;
      }
      const findMovie: Promise<AxiosResponse<Show>> = pathname.includes(
        '/tv-shows',
      )
        ? MovieService.findTvSeries(movieId)
        : MovieService.findMovie(movieId);
      findMovie
        .then((response: AxiosResponse<Show>) => {
          const { data } = response;
          useModalStore.setState({ show: data, open: true, play: true });
        })
        .catch((error) => {
          console.log(`findMovie: `, error);
        });
    }
  };



  const queryIsValid = searchStore && typeof searchStore.query === 'string';
  const hasActiveSearch = queryIsValid && searchStore.query.length > 0;
  
  const showsAreValid = Array.isArray(featuredShows);
  const noShowsToDisplay = !showsAreValid || featuredShows.length === 0;

  if (hasActiveSearch || noShowsToDisplay) {
    return null;
  }

  const currentShow = featuredShows[currentIndex];

  // const [isVideoReady, setIsVideoReady] = React.useState(false); // Video removed

  return (
    <section aria-label="Hero" className="w-full">
      {currentShow && (
        <>
          <div className="absolute inset-0 z-0 h-[100vw] w-full sm:h-[56.25vw] bg-black">
            <CustomImage
              src={`https://image.tmdb.org/t/p/original${currentShow?.backdrop_path ?? currentShow?.poster_path ?? ''}`}
              alt={currentShow?.title ?? currentShow?.name ?? 'poster'}
              className="-z-30 h-auto w-full object-cover opacity-100"
              key={currentShow.id} // Add key for image transition
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 33vw"
              fill
              priority
              style={{
                objectFit: 'cover',
              }}
            />
            {/* YouTube video player removed */}
            <div className="absolute bottom-0 left-0 right-0 top-0">
              <div className="absolute bottom-[35%] left-[4%] top-0 z-10 flex w-[36%] flex-col justify-end space-y-2">
                <h1 className="text-[3vw] font-bold">
                  {currentShow?.title ?? currentShow?.name}
                </h1>
                <div className="flex space-x-2 text-[2vw] font-semibold md:text-[1.2vw]">
                  <p className="text-green-600">
                    {Math.round(currentShow?.vote_average * 10) ?? '-'}% Match
                  </p>
                  {/* <p className="text-gray-300">{randomShow?.release_date ?? "-"}</p> */}
                  <p>{currentShow?.release_date ?? '-'}</p>
                </div>
                {/* <p className="line-clamp-4 text-sm text-gray-300 md:text-base"> */}
                <p className="hidden text-[1.2vw] sm:line-clamp-3">
                  {currentShow?.overview ?? '-'}
                </p>
                <div className="mt-[1.5vw] flex items-center space-x-2">
                  <Link
                    prefetch={false}
                    href={`/watch/${
                      currentShow.media_type === MediaType.MOVIE ? 'movie' : 'tv'
                    }/${currentShow.id}`}
                  >
                    <Button
                      aria-label="Play video"
                      className="h-auto flex-shrink-0 gap-2 rounded-xl"
                      // onClick={() => {
                      //   modalStore.setShow(randomShow);
                      //   modalStore.setOpen(true);
                      //   modalStore.setPlay(true);
                      // }}
                    >
                      <Icons.play className="fill-current" aria-hidden="true" />
                      Play
                    </Button>
                  </Link>
                  <Button
                    aria-label="Open show's details modal"
                    variant="outline"
                    className="h-auto flex-shrink-0 gap-2 rounded-xl"
                    onClick={() => {
                      modalStore.setShow(currentShow);
                      modalStore.setOpen(true);
                      modalStore.setPlay(true);
                    }}
                  >
                    <Icons.info aria-hidden="true" />
                    More Info
                  </Button>
                </div>
              </div>
            </div>{' '}
            <div className="opacity-71 absolute inset-0 right-[26.09%] z-[8] bg-gradient-to-r from-secondary to-85%"></div>
            <div className="absolute bottom-[-1px] left-0 right-0 z-[8] h-[14.7vw] bg-gradient-to-b from-background/0 from-30% via-background/30 via-50% to-background to-80%"></div>
          </div>
          <div className="relative inset-0 -z-50 mb-5 pb-[60%] sm:pb-[40%]"></div>
          {/* Removed Navigation Dots */}
        </>
      )}
    </section>
  );
};

export default Hero;
