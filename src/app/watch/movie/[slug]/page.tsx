/*import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';

export const revalidate = 3600;

export default function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop();

  // Example with vidbinge.dev
  //return <EmbedPlayer url={`https://vidsrc.su/embed/movie/${id}`} />;
  //return <EmbedPlayer url={`https://flicky.host/embed/movie/?id=${id}`} />;
  //return <EmbedPlayer url={`https://vidbinge.dev/embed/movie/${id}`} />;
  //return <EmbedPlayer url={`https://vidlink.pro/movie/${id}?primaryColor=63b8bc&secondaryColor=a2a2a2&iconColor=eefdec&icons=vid&player=default&title=true&poster=true&autoplay=true&nextbutton=false`} />;

  // You can switch between these options by uncommenting the desired line:
  return <EmbedPlayer url={`https://embed.su/embed/movie/${id}`} />;
  //return <EmbedPlayer url={`https://player.vidsrc.nl/embed/movie/${id}`} />;
  //return <EmbedPlayer url={`https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`} />;
  // return <EmbedPlayer url={`https://vidsrc.me/embed/movie/${id}?autoPlay=true`} />;
}
*/


//fixed error 404 for movies 



import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';

export const revalidate = 3600;

async function getWorkingEmbedUrl(id: string): Promise<string | null> {
  try {
    const res = await fetch(`https://streamverse-providers-17iy.onrender.com/api/embed/${id}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return data.url || null;
    }
  } catch (err) {
    console.error('❌ Failed to fetch embed URL from server:', err);
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
