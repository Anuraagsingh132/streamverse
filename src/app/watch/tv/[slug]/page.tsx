'use client';

import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';
import { useSearchParams } from 'next/navigation';

// export const revalidate = 3600; // revalidate is not typically used with client components that rely on searchParams for dynamic content

export default function Page({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const id = params.slug.split('-').pop();
  
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  // Construct the embed URL dynamically
  //const embedUrl = `https://embed.su/embed/tv/${id}/${season}/${episode}`;
  const embedUrl = `https://vidsrc.su/tv/${id}/${season}/${episode}?autoplay=true&colour=O0ff9d&autonextepisode=true';
  
  // const embedUrl = `https://vidbinge.dev/embed/tv/${id}/${season}/${episode}`;
  // const embedUrl = `https://flicky.host/embed/tv/${id}/${season}/${episode}`;
 
  return <EmbedPlayer url={embedUrl} />;
}
