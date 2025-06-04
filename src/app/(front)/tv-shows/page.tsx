import Hero from '@/components/hero';
import RecentlyStartedCarousel from '@/components/RecentlyStartedCarousel';
import ShowsContainer from '@/components/shows-container';
import { siteConfig } from '@/configs/site';
import { Genre } from '@/enums/genre';
import { RequestType, type ShowRequest } from '@/enums/request-type';
import { getRandomShow } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { MediaType, type Show } from '@/types';

export const revalidate = 3600;

export default async function TvShowPage() {
  const h1 = `${siteConfig.name} TV Shows`;
  const requests: ShowRequest[] = [
    {
      title: 'Trending Now',
      req: { requestType: RequestType.TRENDING, mediaType: MediaType.TV },
      visible: true,
    },
    {
      title: 'Netflix TV Shows',
      req: { requestType: RequestType.NETFLIX, mediaType: MediaType.TV },
      visible: true,
    },
    {
      title: 'Top Rated',
      req: {
        requestType: RequestType.TOP_RATED,
        mediaType: MediaType.TV,
      },
      visible: true,
    },
    {
      title: 'Most Popular',
      req: {
        requestType: RequestType.POPULAR,
        mediaType: MediaType.TV,
      },
      visible: true,
    },
    {
      title: 'Action & Adventure',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.ACTION_ADVENTURE,
      },
      visible: true,
    },
    {
      title: 'Animation',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.ANIMATION,
      },
      visible: true,
    },
    {
      title: 'Comedy',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.COMEDY,
      },
      visible: true,
    },
    {
      title: 'Crime',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.CRIME,
      },
      visible: true,
    },
    {
      title: 'Documentary',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.DOCUMENTARY,
      },
      visible: true,
    },
    {
      title: 'Drama',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.DRAMA,
      },
      visible: true,
    },
    {
      title: 'Family',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.FAMILY,
      },
      visible: true,
    },
    {
      title: 'Kids',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.KIDS,
      },
      visible: true,
    },
    {
      title: 'Mystery',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.MYSTERY,
      },
      visible: true,
    },
    {
      title: 'News',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.TV,
        genre: Genre.NEWS,
      },
      visible: true,
    },
  ];

  const allShows = await MovieService.getShows(requests);
  const randomShow: Show | null = getRandomShow(allShows);

  return (
    <>
      <h1 className="hidden">{h1}</h1>
      <Hero randomShow={randomShow} />
      <RecentlyStartedCarousel mediaTypeFilter={MediaType.TV} />
      <ShowsContainer shows={allShows} />
    </>
  );
}
