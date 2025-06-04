import Hero from '@/components/hero';
import RecentlyStartedCarousel from '@/components/RecentlyStartedCarousel';
import ShowsContainer from '@/components/shows-container';
import { siteConfig } from '@/configs/site';
import { Genre } from '@/enums/genre';
import { RequestType, type ShowRequest } from '@/enums/request-type';
// import { getRandomShow } from '@/lib/utils'; // No longer using randomShow for Hero
import MovieService from '@/services/MovieService';
import { MediaType, type Show } from '@/types';

export const revalidate = 3600;

export default async function MoviePage() {
  const h1 = `${siteConfig.name} Movie`;

  const requests: ShowRequest[] = [
    {
      title: 'Trending Now',
      req: { requestType: RequestType.TRENDING, mediaType: MediaType.MOVIE },
      visible: true,
    },
    {
      title: 'Netflix Movies',
      req: { requestType: RequestType.NETFLIX, mediaType: MediaType.MOVIE },
      visible: true,
    },
    {
      title: 'Popular',
      req: { requestType: RequestType.POPULAR, mediaType: MediaType.MOVIE },
      visible: true,
    },
    {
      title: 'Top Rated',
      req: { requestType: RequestType.TOP_RATED, mediaType: MediaType.MOVIE },
      visible: true,
    },
    {
      title: 'Most Popular',
      req: { requestType: RequestType.POPULAR, mediaType: MediaType.MOVIE },
      visible: true,
    },
    {
      title: 'Action',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.ACTION,
      },
      visible: true,
    },
    {
      title: 'Adventure',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.ADVENTURE,
      },
      visible: true,
    },
    {
      title: 'Animation',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.ANIMATION,
      },
      visible: true,
    },
    {
      title: 'Comedy',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.COMEDY,
      },
      visible: true,
    },
    {
      title: 'Crime',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.CRIME,
      },
      visible: true,
    },
    {
      title: 'Documentary',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.DOCUMENTARY,
      },
      visible: true,
    },
    {
      title: 'Drama',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.DRAMA,
      },
      visible: true,
    },
    {
      title: 'Family',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.FAMILY,
      },
      visible: true,
    },
    {
      title: 'Fantasy',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.FANTASY,
      },
      visible: true,
    },
    {
      title: 'History',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.HISTORY,
      },
      visible: true,
    },
    {
      title: 'Horror',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.HORROR,
      },
      visible: true,
    },
    {
      title: 'Music',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.MUSIC,
      },
      visible: true,
    },
  ];

  const allShows = await MovieService.getShows(requests);
    const MAX_HERO_ITEMS = 5;
  const featuredShowsForHero: Show[] = [];

  for (const category of allShows) {
    if (category && category.shows && category.shows.length > 0) {
      for (const show of category.shows) {
        if (featuredShowsForHero.length >= MAX_HERO_ITEMS) break;
        // Ensure the show has a backdrop and is not already added
        if (show && show.backdrop_path && !featuredShowsForHero.find(s => s.id === show.id)) {
          featuredShowsForHero.push(show);
        }
      }
    }
    if (featuredShowsForHero.length >= MAX_HERO_ITEMS) break;
  }

  // Fallback if not enough shows with backdrops were found from the initial loop (optional, but good for robustness)
  if (featuredShowsForHero.length < MAX_HERO_ITEMS) {
    for (const category of allShows) {
      if (category && category.shows && category.shows.length > 0) {
        for (const show of category.shows) {
          if (featuredShowsForHero.length >= MAX_HERO_ITEMS) break;
          // Looser condition: just ensure it's a show and not already added
          if (show && !featuredShowsForHero.find(s => s.id === show.id)) {
            featuredShowsForHero.push(show);
          }
        }
      }
      if (featuredShowsForHero.length >= MAX_HERO_ITEMS) break;
    }
  }

  return (
    <>
      <h1 className="hidden">{h1}</h1>
      <Hero featuredShows={featuredShowsForHero} />
      <RecentlyStartedCarousel mediaTypeFilter={MediaType.MOVIE} />
      <ShowsContainer shows={allShows} />
    </>
  );
}
