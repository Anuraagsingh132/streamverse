import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';

export const revalidate = 3600;

async function getWorkingSeriesUrl(id: string): Promise<string | null> {
  const sources = [
    

    
(id: string) => `https://embed.su/embed/tv/${id}/1/1`,
(id: string) => `https://vidsrc.pro/embed/tv/${id}/1/1`,
(id: string) => `https://vidsrc.xyz/embed/tv/${id}?season=1&episode=1`,
(id: string) => `https://www.NontonGo.win/embed/tv/${id}/1/1`,
(id: string) => `https://www.NontonGo.win/embed/tv/?id=${id}&s=1&e=1`,
(id: string) => `https://vidlink.pro/tv/${id}/1/1?primaryColor=%23FFFFFF&secondaryColor=%23FFFFFF&iconColor=%23ffffff&nextbutton=true&autoplay=false`,
(id: string) => `https://vidbinge.dev/embed/tv/${id}/1/1`,
(id: string) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=1&e=1`,
(id: string) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=1&e=1`,
(id: string) => `https://vidsrc.icu/embed/tv/${id}/1/1`,


  ];

  for (const makeUrl of sources) {
    const url = makeUrl(id);
    try {
      const response = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (response.status === 200) {
        return url;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop()!;
  const workingUrl = await getWorkingSeriesUrl(id);

  if (!workingUrl) {
    return (
      <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
        ❌ Sorry, we couldn’t find a working stream for this series.
      </div>
    );
  }

  return <EmbedPlayer url={workingUrl} />;
}
