import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';

export const revalidate = 3600;

async function getWorkingEmbedUrl(id: string): Promise<string | null> {
  const sources = [
    /*(id: string) => `https://embed.su/embed/movie/${id}`,
    (id: string) => `https://flicky.host/embed/movie/?id=${id}`,
    (id: string) => `https://vidlink.pro/movie/${id}`,
    (id: string) => `https://vidsrc.su/embed/movie/${id}`,
    //(id: string) => `https://vidbinge.dev/embed/movie/${id}`,*/

    
(id: string) => `https://embed.su/embed/movie/${id}`,
(id: string) => `https://player.autoembed.cc/embed/movie/${id}`,
(id: string) => `https://player.smashy.stream/movie/${id}`,
(id: string) => `https://vidsrc.xyz/embed/movie/${id}`,
(id: string) => `https://2anime.xyz/embed/${id}-episode-1`,
(id: string) => `https://www.2embed.cc/embed/${id}`,
(id: string) => `https://www.nontongo.win/embed/movie/${id}`,
(id: string) => `https://vidlink.pro/movie/${id}?primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF&autoplay=false`,
(id: string) => `https://vidlink.pro/movie/${id}?player=jw&multiLang=true&primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF`,
(id: string) => `https://vidbinge.dev/embed/movie/${id}`,
(id: string) => `https://moviesapi.club/movie/${id}`,
(id: string) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
(id: string) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
(id: string) => `https://vidsrc.icu/embed/movie/${id}`,

  ];

  for (const makeUrl of sources) {
    const url = makeUrl(id);
    try {
      const response = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (response.status === 200) {
        return url;
      }
    } catch (error) {
      // If error (e.g. DNS fail), continue to next
      continue;
    }
  }

  return null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop()!;
  const workingUrl = await getWorkingEmbedUrl(id);

  if (!workingUrl) {
    return (
      <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
        ❌ Sorry, we couldn’t find a working stream for this movie.
      </div>
    );
  }

  return <EmbedPlayer url={workingUrl} />;
}
