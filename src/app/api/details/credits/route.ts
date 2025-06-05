import { NextRequest, NextResponse } from 'next/server';
import { CreditsResponse, MediaType } from '@/types';

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

  

  const url = `${TMDB_PROXY_URL}/${type}/${id}/credits?language=en-US`;

  try {
    const tmdbResponse = await fetch(url);
    if (!tmdbResponse.ok) {
      const errorData = await tmdbResponse.json();
      console.error(`TMDb API error for credits (${type}/${id}):`, tmdbResponse.status, errorData);
      return NextResponse.json({ error: `Failed to fetch credits from TMDb: ${errorData.status_message || tmdbResponse.statusText}` }, { status: tmdbResponse.status });
    }

    const creditsData: CreditsResponse = await tmdbResponse.json();
    return NextResponse.json(creditsData);
  } catch (error) {
    console.error(`Error fetching credits for ${type}/${id}:`, error);
    return NextResponse.json({ error: 'Internal server error while fetching credits' }, { status: 500 });
  }
}
