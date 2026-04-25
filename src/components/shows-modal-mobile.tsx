'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { getMobileDetect, getYear } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { useModalStore } from '@/stores/modal';
import {
  MediaType,
  type Genre,
  type ShowWithGenreAndVideo,
  type VideoResult,
} from '@/types';
import { type Show } from '@/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import Youtube from 'react-youtube';
import CustomImage from './custom-image';

type YouTubePlayer = {
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  seekTo: (value: number) => void;
  container: HTMLDivElement;
  internalPlayer: YouTubePlayer;
};

type YouTubeEvent = {
  target: YouTubePlayer;
};

const defaultOptions: Record<string, object> = {
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    rel: 0,
    mute: 0,
    loop: 1,
    autoplay: 1,
    controls: 0,
    showinfo: 0,
    disablekb: 1,
    enablejsapi: 1,
    playsinline: 1,
    cc_load_policy: 0,
    modestbranding: 3,
  },
};

interface ShowModalProps {
  show: Show;
}

const ShowModal = ({ show: showProp }: ShowModalProps) => {
  // stores
  const modalStore = useModalStore();
  const router = useRouter();
  const IS_MOBILE: boolean = React.useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const { isMobile } = getMobileDetect(navigator.userAgent);
    return isMobile();
  }, []);

  const [trailer, setTrailer] = React.useState('');
  const [isPlaying, setPlaying] = React.useState(true);
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [isMuted, setIsMuted] = React.useState<boolean>(IS_MOBILE);
  const [options, setOptions] =
    React.useState<Record<string, object>>(defaultOptions);
  const [showTrailer, setShowTrailer] = React.useState(false);

  React.useEffect(() => {
    if (trailer) {
      const timer = setTimeout(() => setShowTrailer(true), 300); // Delay for modal animation
      return () => clearTimeout(timer);
    } else {
      setShowTrailer(false);
    }
  }, [trailer]);

  const youtubeRef = React.useRef(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // get trailer and genres of show
  React.useEffect(() => {
    if (IS_MOBILE) {
      setOptions((state: Record<string, object>) => ({
        ...state,
        playerVars: { ...state.playerVars, mute: 1 },
      }));
    }
    void handleGetData();
  }, []);

  const handleGetData = async () => {
    const id: number | undefined = showProp?.id;
    const type: string =
      showProp?.media_type === MediaType.TV ? 'tv' : 'movie';
    if (!id || !type) {
      return;
    }
    const data: ShowWithGenreAndVideo = await MovieService.findMovieByIdAndType(
      id,
      type,
    );
    if (data?.genres) {
      setGenres(data.genres);
    }
    if (data.videos?.results?.length) {
      const videoData: VideoResult[] = data.videos?.results;
      const result: VideoResult | undefined = videoData.find(
        (item: VideoResult) => item.type === 'Trailer',
      );
      if (result?.key) setTrailer(result.key);
    }
  };

  const handleCloseModal = () => {
    modalStore.reset();
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.delete('modal');
    newSearchParams.delete('type');
    const searchStr = newSearchParams.toString();
    const newUrl = searchStr ? `?${searchStr}` : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  const onEnd = (event: YouTubeEvent) => {
    event.target.seekTo(0);
  };

  const onPlay = () => {
    if (imageRef.current) {
      imageRef.current.style.opacity = '0';
    }
    if (youtubeRef.current) {
      const iframeRef: HTMLElement | null =
        document.getElementById('video-trailer');
      if (iframeRef) iframeRef.classList.remove('opacity-0');
    }
  };

  const onReady = (event: YouTubeEvent) => {
    event.target.playVideo();
  };

  const handleChangeMute = () => {
    setIsMuted((state: boolean) => !state);
    if (!youtubeRef.current) return;
    const videoRef: YouTubePlayer = youtubeRef.current as YouTubePlayer;
    if (isMuted && youtubeRef.current) {
      videoRef.internalPlayer.unMute();
    } else if (youtubeRef.current) {
      videoRef.internalPlayer.mute();
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={handleCloseModal}
      aria-label="Modal containing show's details">
      <DialogContent className="w-full overflow-hidden rounded-md bg-zinc-900 p-0 text-left align-middle shadow-xl dark:bg-zinc-900 sm:max-w-3xl lg:max-w-4xl">
        <div className="video-wrapper relative aspect-video">
          <CustomImage
            fill
            priority
            ref={imageRef}
            alt={showProp?.title ?? 'poster'}
            className="-z-40 z-[1] h-auto w-full object-cover"
            src={`https://image.tmdb.org/t/p/original${showProp?.backdrop_path}`}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 33vw"
          />
          {showTrailer && trailer && (
            <Youtube
              opts={options}
              onEnd={onEnd}
              onPlay={onPlay}
              ref={youtubeRef}
              onReady={onReady}
              videoId={trailer}
              id="video-trailer"
              title={
                showProp?.title ??
                showProp?.name ??
                'video-trailer'
              }
              className="relative aspect-video w-full"
              style={{ width: '100%', height: '100%' }}
              iframeClassName={`relative pointer-events-none w-[100%] h-[100%] z-[-10] opacity-0`}
            />
          )}
          <div className="absolute bottom-6 z-20 flex w-full items-center justify-between gap-2 px-10">
            <div className="flex items-center gap-2.5">
              <Link
                href={`/watch/${showProp?.media_type === MediaType.MOVIE ? 'movie' : 'tv'}/${showProp?.id}`}>
                <Button
                  aria-label={`${isPlaying ? 'Pause' : 'Play'} show`}
                  className="group h-auto rounded py-1.5">
                  <>
                    <Icons.play
                      className="mr-1.5 h-6 w-6 fill-current"
                      aria-hidden="true"
                    />
                    Play
                  </>
                </Button>
              </Link>
            </div>
            <Button
              aria-label={`${isMuted ? 'Unmute' : 'Mute'} video`}
              variant="ghost"
              className="h-auto rounded-full bg-neutral-800 p-1.5 opacity-50 ring-1 ring-slate-400 hover:bg-neutral-800 hover:opacity-100 hover:ring-white focus:ring-offset-0 dark:bg-neutral-800 dark:hover:bg-neutral-800"
              onClick={handleChangeMute}>
              {isMuted ? (
                <Icons.volumeMute className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Icons.volume className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
        <div className="grid gap-2.5 px-10 pb-10">
          <DialogTitle className="text-lg font-medium leading-6 text-slate-50 sm:text-xl">
            {showProp?.title ?? showProp?.name}
          </DialogTitle>
          <div className="flex items-center space-x-2 text-sm sm:text-base">
            <p className="font-semibold text-green-400">
              {Math.round((Number(showProp?.vote_average) / 10) * 100) ?? '-'}
              % Match
            </p>
            {showProp?.release_date ? (
              <p>{getYear(showProp?.release_date)}</p>
            ) : showProp?.first_air_date ? (
              <p>{getYear(showProp?.first_air_date)}</p>
            ) : null}
            {showProp?.original_language && (
              <span className="grid h-4 w-7 place-items-center text-xs font-bold text-neutral-400 ring-1 ring-neutral-400">
                {showProp.original_language.toUpperCase()}
              </span>
            )}
          </div>
          <DialogDescription className="line-clamp-3 text-xs text-slate-50 dark:text-slate-50 sm:text-sm">
            {showProp?.overview ?? '-'}
          </DialogDescription>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-400">Genres:</span>
            {genres.map((genre) => genre.name).join(', ')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShowModal;
