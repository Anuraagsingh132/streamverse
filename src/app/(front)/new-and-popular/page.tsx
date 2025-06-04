import Hero from '@/components/hero';
import ShowsContainer from '@/components/shows-container';
import { siteConfig } from '@/configs/site';
import { RequestType, type ShowRequest } from '@/enums/request-type';
// import { getRandomShow } from '@/lib/utils'; // No longer using randomShow for Hero
import MovieService from '@/services/MovieService';
import { MediaType, type Show } from '@/types';

export const revalidate = 3600;

export default async function NewAndPopularPage() {
  const h1 = `${siteConfig.name} New And Popular`;
  const requests: ShowRequest[] = [
    {
      title: 'Netflix',
      req: { requestType: RequestType.NETFLIX, mediaType: MediaType.TV },
      visible: false,
    },
    {
      title: 'Trending TV Shows',
      req: { requestType: RequestType.TRENDING, mediaType: MediaType.TV },
      visible: true,
    },
    {
      title: 'Trending Movies',
      req: { requestType: RequestType.TRENDING, mediaType: MediaType.MOVIE },
      visible: true,
    },
    {
      title: 'Top Rated TV Shows',
      req: { requestType: RequestType.TOP_RATED, mediaType: MediaType.TV },
      visible: true,
    },
    {
      title: 'Top Rated Movies',
      req: { requestType: RequestType.TOP_RATED, mediaType: MediaType.MOVIE },
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

  // Fallback if not enough shows with backdrops were found from the initial loop
  if (featuredShowsForHero.length < MAX_HERO_ITEMS) {
    for (const category of allShows) {
      if (category && category.shows && category.shows.length > 0) {
        for (const show of category.shows) {
          if (featuredShowsForHero.length >= MAX_HERO_ITEMS) break;
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
      <ShowsContainer shows={allShows} />
    </>
  );
}
