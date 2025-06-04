'use client';

import { Icons } from '@/components/icons';
import { ChevronDown, CheckCircle } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { saveRecent } from '@/lib/localStorageUtils';
import {
  MediaType,
  type Genre,
  type ShowWithGenreAndVideo,
  type VideoResult,
  type Episode,
  type SeasonDetail,
  type SeasonWithEpisodesResponse,
} from '@/types';
import Link from 'next/link';
import { type Show } from '@/types';
import { usePathname } from 'next/navigation';
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

const userAgent =
  typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
const { isMobile } = getMobileDetect(userAgent);
const defaultOptions: Record<string, object> = {
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    rel: 0,
    mute: isMobile() ? 1 : 0,
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
  const IS_MOBILE: boolean = isMobile();
  const router = useRouter();

  const [trailer, setTrailer] = React.useState('');
  const [isPlaying, setPlaying] = React.useState(true);
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [isMuted, setIsMuted] = React.useState<boolean>(
    modalStore.firstLoad || IS_MOBILE,
  );
  const [options, setOptions] =
    React.useState<Record<string, object>>(defaultOptions);

  // State for TV Show Seasons and Episodes
  const [selectedSeasonNumber, setSelectedSeasonNumber] = React.useState<number | null>(null);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = React.useState<boolean>(false);
  const [isEpisodeListVisible, setIsEpisodeListVisible] = React.useState<boolean>(true);

  const youtubeRef = React.useRef(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // get trailer and genres of show
  React.useEffect(() => {
    if (modalStore.firstLoad || IS_MOBILE) {
      setOptions((state: Record<string, object>) => ({
        ...state,
        playerVars: { ...state.playerVars, mute: 1 },
      }));
    }
    void handleGetData();
  }, [modalStore.show?.id]); // Re-run if show ID changes

  // Effect to fetch episodes when selectedSeasonNumber or show ID changes
  React.useEffect(() => {
    const fetchEpisodes = async () => {
      if (modalStore.show?.id && selectedSeasonNumber !== null && modalStore.show.media_type === MediaType.TV) {
        setIsEpisodeListVisible(false); // Start fade-out
        // Add a small delay to allow fade-out before skeleton appears
        await new Promise(resolve => setTimeout(resolve, 150)); // 150ms delay for fade-out
        setIsLoadingEpisodes(true);
        try {
          const response = await MovieService.getTvSeasonDetails(modalStore.show.id, selectedSeasonNumber);
          setEpisodes(response.data.episodes || []);
        } catch (error) {
          console.error('Failed to fetch episodes:', error);
          setEpisodes([]); // Clear episodes on error
        }
        setIsLoadingEpisodes(false);
        setIsEpisodeListVisible(true); // Start fade-in
      } else {
        // If not a TV show, or no season selected, or show ID is missing
        setEpisodes([]);
        setIsEpisodeListVisible(false);
      }
    };
    void fetchEpisodes();
  }, [modalStore.show?.id, selectedSeasonNumber, modalStore.show?.media_type]);

  const handleGetData = async () => {
    const id: number | undefined = modalStore.show?.id;
    const type: string =
      modalStore.show?.media_type === MediaType.TV ? 'tv' : 'movie';
    if (!id || !type) {
      return;
    }
    const data: ShowWithGenreAndVideo = await MovieService.findMovieByIdAndType(
      id,
      type,
    );
    // Update the modal store with the full data, ensuring media_type is correctly set
    const showDataForStore = { ...data, media_type: type as MediaType };
    modalStore.setShow(showDataForStore);
    console.log('Fetched show data for modal (and updated store with explicit media_type):', showDataForStore);
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

    // If it's a TV show
    if (type === 'tv' && data.seasons && data.seasons.length > 0) {
      console.log('Raw seasons from API:', data.seasons);
      const displayableSeasons = data.seasons.filter(season => season.episode_count > 0 && season.name !== "Specials");
      console.log('Displayable seasons (filtered for episode_count > 0 and name !== \"Specials\"):', displayableSeasons);
      if (displayableSeasons.length > 0) {
        console.log('Setting initial selected season number to:', displayableSeasons[0].season_number);
        setSelectedSeasonNumber(displayableSeasons[0].season_number);
      } else {
        console.log('No displayable seasons found after filtering.');
        setSelectedSeasonNumber(null); // No seasons with episodes
      }
    } else {
      console.log('Not a TV show, or no seasons array in API response, or seasons array is empty. Clearing selectedSeasonNumber.');
      setSelectedSeasonNumber(null); // Not a TV show or no seasons
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

  const createSlug = (name: string, id: number | string): string => {
    const cleanedName = name
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w-]+/g, ''); // Remove non-word characters (except hyphens)
    return `${cleanedName}-${id}`;
  };

  const handlePlayEpisode = (episodeToPlay: Episode) => {
    if (!modalStore.show || !modalStore.show.id) {
      console.error("Show details or ID not available to play episode.");
      return;
    }

    const showName = modalStore.show.name || modalStore.show.title || 'show';
    const slug = createSlug(showName, modalStore.show.id);
    
    const url = `/watch/tv/${slug}?season=${episodeToPlay.season_number}&episode=${episodeToPlay.episode_number}`;
    
    router.push(url);
    // modalStore.onClose(); // Let's keep the modal open for now, user might want to quickly switch episodes. Or close it if preferred.
    // Decided to keep modal open for now based on typical UX allowing quick selection of other episodes.
    // If closing is preferred, uncomment the line above and potentially the modalStore.reset() from handleCloseModal.
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
      open={modalStore.open}
      onOpenChange={handleCloseModal}
      aria-label="Modal containing show's details">
      <DialogContent className="w-full h-[85vh] overflow-y-auto overflow-x-hidden rounded-md bg-zinc-900 p-0 text-left align-middle shadow-xl dark:bg-zinc-900 sm:max-w-3xl lg:max-w-4xl scrollbar-hide">
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
              className="relative aspect-video w-full"
              style={{ width: '100%', height: '100%' }}
              iframeClassName={`relative pointer-events-none w-[100%] h-[100%] z-[-10] opacity-0`}
            />
          )}
          <div className="absolute bottom-6 z-20 flex w-full items-center justify-between gap-2 px-10">
            <div className="flex items-center gap-2.5">
              <Link
                href={`/watch/${modalStore.show?.media_type === MediaType.MOVIE ? 'movie' : 'tv'}/${modalStore.show?.id}`}
                onClick={() => {
                  if (modalStore.show) {
                    saveRecent(modalStore.show as Show); // WatchedItem progress can be added later
                  }
                }}
              >
                <Button
                  aria-label={`Play show`}
                  className="group h-auto rounded py-1.5"
                >
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

          {/* Season Selector for TV Shows Debugging */}
          {(() => {
            const isTvShow = modalStore.show?.media_type === MediaType.TV;
            const seasonsFromStore = modalStore.show?.seasons;
            console.log('[UI Render] modalStore.show.media_type:', modalStore.show?.media_type);
            console.log('[UI Render] modalStore.show.seasons (raw from store):', seasonsFromStore);

            const _displayableSeasonsFromStore = (isTvShow && seasonsFromStore)
              ? seasonsFromStore.filter(s => s.episode_count > 0 && s.name !== "Specials")
              : [];
            console.log('[UI Render] Displayable seasons calculated for UI:', _displayableSeasonsFromStore);

            if (isTvShow && _displayableSeasonsFromStore.length > 0) {
              return (
                <div className="mt-4 flex items-center gap-3">
                  <label htmlFor="season-select" className="text-sm text-slate-500 whitespace-nowrap">
                    Seasons:
                  </label>
                  <div className="relative w-full sm:w-auto">
                    <select
                      id="season-select"
                      value={selectedSeasonNumber ?? ''}
                      onChange={(e) => setSelectedSeasonNumber(Number(e.target.value))}
                      className="appearance-none block w-full sm:w-auto bg-slate-800 text-slate-50 rounded-full pl-4 pr-10 py-2 text-sm border-0 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      {_displayableSeasonsFromStore.map((season) => (
                        <option key={season.id} value={season.season_number} className="bg-slate-800 text-slate-50">
                          {season.name} ( {season.episode_count} Episodes )
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Episode List for TV Shows */}
          {modalStore.show?.media_type === MediaType.TV && (
            <div className={`mt-6 px-1 transition-opacity duration-300 ease-in-out ${isEpisodeListVisible ? 'opacity-100' : 'opacity-0'}`}> {/* Adjusted padding & added transition */}
              {isLoadingEpisodes ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center py-2 border-b border-slate-800 animate-pulse last:border-b-0">
                      <div className="flex-shrink-0 w-40 h-[90px] rounded-md bg-slate-700"></div> {/* Thumbnail Placeholder */}
                      <div className="flex-grow px-4 space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div> {/* Title Placeholder */}
                        <div className="h-3 bg-slate-700 rounded w-1/2"></div> {/* Runtime/Date Placeholder */}
                        <div className="h-3 bg-slate-700 rounded w-5/6"></div> {/* Synopsis Line 1 Placeholder */}
                      </div>
                      <div className="px-2 flex-shrink-0">
                        <div className="h-7 w-7 bg-slate-700 rounded-full"></div> {/* Play Icon Placeholder */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className="group flex cursor-pointer items-center rounded-lg py-3 sm:py-4 border-b border-slate-800 last:border-b-0 hover:bg-slate-800/60 transition-colors duration-150"
                    onClick={() => handlePlayEpisode(episode)}
                  >
                    {/* A) Episode Thumbnail */}
                    <div className="flex-shrink-0 w-40 h-[90px] rounded-md overflow-hidden bg-slate-700 relative group/thumb">
                      {episode.still_path ? (
                        <CustomImage
                          src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                          alt={`Poster for ${episode.name}, episode ${episode.episode_number}`}
                          width={160} // w-40
                          height={90} // h-[90px]
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icons.placeholder className="h-10 w-10 text-slate-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200">
                        <Icons.play className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* B) Episode Information Block */}
                    <div className="flex-grow px-4">
                      {(() => {
                        const isWatched = episode.episode_number < 3; // Simulate watched state
                        return (
                          <h4 className={`text-base font-medium transition-colors duration-150 flex items-center ${isWatched ? 'text-slate-400 group-hover:text-sky-500' : 'text-slate-100 group-hover:text-sky-300'}`}>
                            {isWatched && <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />}
                            <span className="text-sky-400 font-semibold mr-1.5">{episode.episode_number}.</span>{episode.name}
                          </h4>
                        );
                      })()}
                      <div className="mt-1 text-xs">
                        {episode.runtime && (
                          <span className="text-slate-400">
                            {episode.runtime} min
                          </span>
                        )}
                        {episode.air_date && (
                          <span className="text-slate-500 ml-2">
                            {new Date(episode.air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {episode.overview && (
                         <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">
                           {episode.overview}
                         </p>
                      )}
                    </div>

                    {/* C) Actions (Play Icon) */}
                    <div className="px-2 flex-shrink-0">
                      <button 
                        className="p-1.5 rounded-full hover:bg-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-opacity-75 transition-colors duration-150"
                        aria-label={`Play ${episode.name}`}
                        onClick={(e) => { e.stopPropagation(); handlePlayEpisode(episode); }}
                      >
                        <Icons.play className="h-6 w-6 text-slate-300 group-hover:text-sky-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {modalStore.show?.media_type === MediaType.TV && !isLoadingEpisodes && episodes.length === 0 && selectedSeasonNumber !== null && (
            <div className="py-10 text-center text-slate-400">
              No episodes found for this season.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShowModal;
