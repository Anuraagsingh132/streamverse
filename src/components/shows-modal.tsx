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
import UserService from '@/services/UserService/UserService';
import { useAuthStore } from '@/services/AuthService/AuthService';
import { useModalStore } from '@/stores/modal';
import {
  MediaType,
  type Genre,
  type ShowWithGenreAndVideo,
  type VideoResult,
} from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import Youtube from 'react-youtube';
import CustomImage from './custom-image';
import { toast } from 'sonner';

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

const userAgent =
  typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
const { isMobile } = getMobileDetect(userAgent);
const defaultOptions: Record<string, object> = {
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    rel: 0,
    mute: 1, // Always start muted to avoid autoplay issues
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

const ShowModal = () => {
  // stores
  const modalStore = useModalStore();
  const IS_MOBILE: boolean = typeof window !== 'undefined' ? isMobile() : false;

  const [trailer, setTrailer] = React.useState('');
  const [isPlaying, setPlaying] = React.useState(false);
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [isMuted, setIsMuted] = React.useState<boolean>(true); // Always start muted
  const [options, setOptions] = React.useState<Record<string, object>>(defaultOptions);
  const [isInWatchlist, setIsInWatchlist] = React.useState<boolean>(false);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = React.useState<boolean>(false);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  const { user, isAuthenticated } = useAuthStore();
  const youtubeRef = React.useRef<any>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Client-side only effect
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // get trailer and genres of show
  React.useEffect(() => {
    if (!isMounted) return;
    
    void handleGetData();

    // Reset when a new show is loaded
    setIsMuted(true);
    setPlaying(false);
  }, [isMounted, modalStore.show?.id]);

  // Start playing when the modal is opened with play=true
  React.useEffect(() => {
    if (!isMounted) return;
    
    if (modalStore.open && modalStore.play && trailer) {
      console.log('Auto-playing trailer:', trailer);
      setPlaying(true);
      
      // Make sure we set the correct YouTube player options for autoplay
      setOptions({
        ...defaultOptions,
        playerVars: {
          ...defaultOptions.playerVars,
          autoplay: 1,
          mute: 1
        }
      });
    }
  }, [isMounted, modalStore.open, modalStore.play, trailer]);

  // Check if the show is in the user's watchlater
  React.useEffect(() => {
    if (!isMounted) return;
    
    const checkWatchlist = async () => {
      if (isAuthenticated && user && modalStore.show?.id) {
        try {
          setIsAddingToWatchlist(true);
          const result = await UserService.isInWatchlist(user.id, modalStore.show.id);
          setIsInWatchlist(result);
        } catch (error) {
          console.error('Error checking watchlater status:', error);
        } finally {
          setIsAddingToWatchlist(false);
        }
      }
    };
    
    // Only check if authenticated and show exists
    if (isAuthenticated && user && modalStore.show?.id) {
      void checkWatchlist();
    } else {
      // Reset state if not authenticated
      setIsInWatchlist(false);
    }
  }, [isAuthenticated, user, modalStore.show, isMounted]);

  const handleGetData = async () => {
    const id: number | undefined = modalStore.show?.id;
    const type: string =
      modalStore.show?.media_type === MediaType.TV ? 'tv' : 'movie';
    if (!id || !type) {
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('Error fetching show details:', error);
    }
  };

  const handleCloseModal = () => {
    modalStore.reset();
    if (!modalStore.show || modalStore.firstLoad) {
      window.history.pushState(null, '', '/home');
    } else {
      window.history.back();
    }
  };

  const onEnd = (event: YouTubeEvent) => {
    event.target.seekTo(0);
  };

  const onReady = (event: YouTubeEvent) => {
    console.log('YouTube player ready');
    // If play mode is active, start playing right away
    if (modalStore.play) {
      console.log('Auto-playing video');
      event.target.playVideo();
      
      // Unmute after a short delay (this helps with autoplay policies)
      setTimeout(() => {
        console.log('Unmuting video');
        event.target.unMute();
        setIsMuted(false);
      }, 800);
    }
  };

  const onPlay = () => {
    console.log('YouTube video playing');
    setPlaying(true);
    
    // If the video was muted by default, unmute it now
    if (isMuted && youtubeRef.current?.internalPlayer) {
      setTimeout(() => {
        youtubeRef.current.internalPlayer.unMute();
        setIsMuted(false);
      }, 500);
    }
  };

  const handleChangeMute = () => {
    setIsMuted((state: boolean) => !state);
    if (!youtubeRef.current) return;
    
    try {
      const videoRef: YouTubePlayer = youtubeRef.current as YouTubePlayer;
      if (isMuted && youtubeRef.current && videoRef.internalPlayer && typeof videoRef.internalPlayer.unMute === 'function') {
        videoRef.internalPlayer.unMute();
      } else if (youtubeRef.current && videoRef.internalPlayer && typeof videoRef.internalPlayer.mute === 'function') {
        videoRef.internalPlayer.mute();
      }
    } catch (error) {
      console.error('Error changing mute state:', error);
    }
  };

  const handleWatchLater = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to add to Watch Later');
      document.getElementById('auth-modal-trigger')?.click();
      return;
    }

    if (!modalStore.show) return;

    try {
      setIsAddingToWatchlist(true);
      
      // Optimistic UI update first for immediate feedback
      setIsInWatchlist(prevState => !prevState);
      
      if (isInWatchlist) {
        // If already in watchlater, we need to find and remove it
        try {
          // First get the watchlater to find the item ID
          const watchlist = await UserService.getWatchlist(user.id);
          const item = watchlist.find(item => Number(item.movieId) === Number(modalStore.show?.id));
          
          if (item) {
            // Remove from watchlater (cache is already updated)
            await UserService.removeFromWatchlist(user.id, item.id);
            toast.success('Removed from Watch Later');
          } else {
            // Edge case: Database shows it's in watchlater but we can't find it
            toast.error('Could not find this show in your Watch Later list');
            
            // Force a refresh of the watchlater (in background)
            UserService.refreshWatchlist(user.id).catch(console.error);
            
            // Reset UI state
            setIsInWatchlist(false);
          }
        } catch (removeError) {
          console.error('Error removing from watchlater:', removeError);
          toast.error('Failed to remove from Watch Later list');
          
          // Revert optimistic update on error
          setIsInWatchlist(true);
        }
      } else {
        // Add to watchlater with proper validation - cache is updated inside
        await UserService.addToWatchlist(user.id, {
          movieId: Number(modalStore.show.id),
          title: modalStore.show.title || modalStore.show.name || 'Unknown',
          posterPath: modalStore.show.poster_path || modalStore.show.backdrop_path || '',
          mediaType: modalStore.show.media_type || 'movie',
        });
        
        toast.success('Added to Watch Later');
      }
    } catch (error) {
      console.error('Error updating watchlater:', error);
      toast.error('Failed to update Watch Later list');
      
      // Revert optimistic update on error
      setIsInWatchlist(!isInWatchlist);
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  // If not mounted (server-side), render a placeholder to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  return (
    <Dialog
      open={modalStore.open}
      onOpenChange={handleCloseModal}
      aria-label="Modal containing show's details">
      <DialogContent className="w-full overflow-hidden rounded-md bg-zinc-900 p-0 text-left align-middle shadow-xl dark:bg-zinc-900 sm:max-w-3xl lg:max-w-4xl">
        <div className="video-wrapper relative aspect-video">
          <CustomImage
            fill
            priority
            ref={imageRef}
            alt={modalStore?.show?.title ?? 'poster'}
            className="-z-40 z-[1] h-auto w-full object-cover"
            src={`https://image.tmdb.org/t/p/original${modalStore.show?.backdrop_path}`}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 33vw"
          />
          {trailer && (
            <Youtube
              opts={options}
              onEnd={onEnd}
              onPlay={onPlay}
              ref={youtubeRef}
              onReady={onReady}
              videoId={trailer}
              id="video-trailer"
              title={
                modalStore.show?.title ??
                modalStore.show?.name ??
                'video-trailer'
              }
              className="relative z-10 aspect-video w-full"
              style={{ width: '100%', height: '100%' }}
              iframeClassName={`relative pointer-events-none w-[100%] h-[100%] ${isPlaying ? 'opacity-100 z-20' : 'opacity-0 z-[-10]'}`}
            />
          )}
          <div className="absolute bottom-6 z-20 flex w-full items-center justify-between gap-2 px-10">
            <div className="flex items-center gap-2.5">
              <Link
                href={`/watch/${
                  modalStore.show?.media_type === MediaType.MOVIE
                    ? 'movie'
                    : 'tv'
                }/${modalStore.show?.id}`}>
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
              
              <Button
                onClick={handleWatchLater}
                disabled={isAddingToWatchlist}
                aria-label="Add to watch later"
                variant="outline"
                className="group h-auto rounded py-1.5">
                <>
                  {isAddingToWatchlist ? (
                    <Icons.loader className="mr-1.5 h-5 w-5 animate-spin" />
                  ) : (
                    <Icons.bookmark className={`mr-1.5 h-5 w-5 ${isInWatchlist ? 'fill-current text-primary' : ''}`} />
                  )}
                  {isInWatchlist ? 'In Watch Later' : 'Watch Later'}
                </>
              </Button>
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
            {modalStore.show?.title ?? modalStore.show?.name}
          </DialogTitle>
          <div className="flex items-center space-x-2 text-sm sm:text-base">
            <p className="font-semibold text-green-400">
              {Math.round((Number(modalStore.show?.vote_average) / 10) * 100) ??
                '-'}
              % Match
            </p>
            {modalStore.show?.release_date ? (
              <p>{getYear(modalStore.show?.release_date)}</p>
            ) : modalStore.show?.first_air_date ? (
              <p>{getYear(modalStore.show?.first_air_date)}</p>
            ) : null}
            {modalStore.show?.original_language && (
              <span className="grid h-4 w-7 place-items-center text-xs font-bold text-neutral-400 ring-1 ring-neutral-400">
                {modalStore.show.original_language.toUpperCase()}
              </span>
            )}
          </div>
          <DialogDescription className="line-clamp-3 text-xs text-slate-50 dark:text-slate-50 sm:text-sm">
            {modalStore.show?.overview ?? '-'}
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
