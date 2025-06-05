import { NextRequest, NextResponse } from 'next/server';
import { MediaType, PaginatedShowResponse, Show } from '@/types';

const TMDB_PROXY_URL = 'https://tmdb-a62z.onrender.com/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') as MediaType.TV | MediaType.MOVIE | null;

  if (!id || !type) {
    return NextResponse.json({ error: 'Missing ID or type query parameter' }, { status: 400 });
  }

  if (type !== MediaType.TV && type !== MediaType.MOVIE) {
    return NextResponse.json({ error: "Invalid type parameter. Must be 'tv' or 'movie'." }, { status: 400 });
  }

  

  // Fetch page 1 of recommendations
  const url = `${TMDB_PROXY_URL}/${type}/${id}/recommendations?language=en-US&page=1`;

  try {
    const tmdbResponse = await fetch(url);
    if (!tmdbResponse.ok) {
      const errorData = await tmdbResponse.json();
      console.error(`TMDb API error for recommendations (${type}/${id}):`, tmdbResponse.status, errorData);
      // Attempt to fetch from /similar if /recommendations fails or returns no results
      if (tmdbResponse.status === 404 || (await tmdbResponse.clone().json()).results?.length === 0) {
        console.log(`Recommendations not found for ${type}/${id}, trying /similar endpoint.`);
        const similarUrl = `${TMDB_PROXY_URL}/${type}/${id}/similar?language=en-US&page=1`;
        const similarTmdbResponse = await fetch(similarUrl);
        if (!similarTmdbResponse.ok) {
          const similarErrorData = await similarTmdbResponse.json();
          console.error(`TMDb API error for similar (${type}/${id}):`, similarTmdbResponse.status, similarErrorData);
          return NextResponse.json({ error: `Failed to fetch recommendations or similar items from TMDb: ${similarErrorData.status_message || similarTmdbResponse.statusText}` }, { status: similarTmdbResponse.status });
        }
        const similarData: PaginatedShowResponse = await similarTmdbResponse.json();
        return NextResponse.json(similarData.results);
      }
      return NextResponse.json({ error: `Failed to fetch recommendations from TMDb: ${errorData.status_message || tmdbResponse.statusText}` }, { status: tmdbResponse.status });
    }

    const recommendationsData: PaginatedShowResponse = await tmdbResponse.json();
    
    // If recommendations are empty, try similar as a fallback
    if (recommendationsData.results.length === 0) {
      console.log(`Recommendations empty for ${type}/${id}, trying /similar endpoint.`);
      const similarUrl = `${TMDB_PROXY_URL}/${type}/${id}/similar?language=en-US&page=1`;
      const similarTmdbResponse = await fetch(similarUrl);
      if (!similarTmdbResponse.ok) {
        const similarErrorData = await similarTmdbResponse.json();
        console.error(`TMDb API error for similar (${type}/${id}) after empty recommendations:`, similarTmdbResponse.status, similarErrorData);
        // Return empty array if similar also fails, rather than erroring the whole request
        return NextResponse.json([]); 
      }
      const similarData: PaginatedShowResponse = await similarTmdbResponse.json();
      return NextResponse.json(similarData.results);
    }

    return NextResponse.json(recommendationsData.results);
  } catch (error) {
    console.error(`Error fetching recommendations for ${type}/${id}:`, error);
    return NextResponse.json({ error: 'Internal server error while fetching recommendations' }, { status: 500 });
  }
}
