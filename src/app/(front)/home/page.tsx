import Hero from '@/components/hero';
import RecentlyStartedCarousel from '@/components/RecentlyStartedCarousel';
import ShowsContainer from '@/components/shows-container';
import { MediaType, type Show } from '@/types';
import { siteConfig } from '@/configs/site';
import { RequestType, type ShowRequest } from '@/enums/request-type';
import MovieService from '@/services/MovieService';
import { Genre } from '@/enums/genre';
import { getRandomShow } from '@/lib/utils';

export const revalidate = 3600;

export default async function Home() {
  const h1 = `${siteConfig.name} Home`;

  const requests: ShowRequest[] = [
    // 🎬 1
    {
      title: 'Blockbuster Hits',
      req: { requestType: RequestType.POPULAR, mediaType: MediaType.MOVIE },
      visible: true,
    },
    // 📺 1
    {
      title: 'Trending TV Shows',
      req: { requestType: RequestType.TRENDING, mediaType: MediaType.TV },
      visible: true,
    },
    // 🎬 2
    {
      title: 'Top Rated Movies',
      req: { requestType: RequestType.TOP_RATED, mediaType: MediaType.MOVIE },
      visible: true,
    },
    // 📺 2
    {
      title: 'Top Rated TV Shows',
      req: {
        requestType: RequestType.TOP_RATED,
        mediaType: MediaType.TV,
      },
      visible: true,
    },
    // 🎬 3
    {
      title: 'Comedy Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.COMEDY,
      },
      visible: true,
    },
    // 📺 3
    {
      title: 'Sitcoms & Comedy Shows',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.COMEDY,
      },
      visible: true,
    },
    // 🎬 4
    {
      title: 'Action Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.ACTION,
      },
      visible: true,
    },
    // 📺 4
    {
      title: 'Crime & Thriller Shows',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.CRIME,
      },
      visible: true,
    },
    // 🎬 5
    {
      title: 'Romance Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.ROMANCE,
      },
      visible: true,
    },
    // 📺 5
    {
      title: 'Drama Series',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.DRAMA,
      },
      visible: true,
    },
    // 🎬 6
    {
      title: 'Sci-Fi & Fantasy Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.SCIENCE_FICTION,
      },
      visible: true,
    },
    // 📺 6
    {
      title: 'Anime Series',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.ANIMATION,
      },
      visible: true,
    },
    // 🎬 7
    {
      title: 'Korean Movies',
      req: {
        requestType: RequestType.KOREAN,
        mediaType: MediaType.MOVIE,
        genre: Genre.THRILLER,
      },
      visible: true,
    },
    // 📺 7
    {
      title: 'Netflix TV Shows',
      req: { requestType: RequestType.NETFLIX, mediaType: MediaType.TV },
      visible: true,
    },
    // 🎬 8
    {
      title: 'Family Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.FAMILY,
      },
      visible: true,
    },
    // 📺 8
    {
      title: 'Reality Shows',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.REALITY,
      },
      visible: true,
    },
    // 🎬 9
    {
      title: 'Documentaries',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.DOCUMENTARY,
      },
      visible: true,
    },
    // 📺 9
    {
      title: 'TV Dramas & Mysteries',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.MYSTERY,
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
        if (show && show.backdrop_path && !featuredShowsForHero.find(s => s.id === show.id)) {
          featuredShowsForHero.push(show);
        }
      }
    }
    if (featuredShowsForHero.length >= MAX_HERO_ITEMS) break;
  }

  // Fallback: If still not enough, try to pick from any show with a backdrop, even if it means less diversity initially.
  if (featuredShowsForHero.length < MAX_HERO_ITEMS) {
    for (const category of allShows) {
      if (category && category.shows) {
        for (const show of category.shows) {
          if (featuredShowsForHero.length >= MAX_HERO_ITEMS) break;
          if (show && show.backdrop_path && !featuredShowsForHero.find(s => s.id === show.id)) {
            featuredShowsForHero.push(show);
          }
        }
      }
      if (featuredShowsForHero.length >= MAX_HERO_ITEMS) break;
    }
  }

  // If still no shows for hero (e.g. allShows was empty or no backdrop_paths), pass an empty array or a default
  // For now, we'll pass what we have, Hero component should handle empty array.

  return (
    <>
      <h1 className="hidden">{h1}</h1>
      <Hero featuredShows={featuredShowsForHero} />
      <RecentlyStartedCarousel />
      <ShowsContainer shows={allShows} />
    </>
  );

}
