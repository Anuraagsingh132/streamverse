'use client';

import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';
import { useSearchParams } from 'next/navigation';


export default function Page({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const id = params.slug.split('-').pop();

  // Default to season 1, episode 1 if not provided
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  // Build the embed URL (client side only)
  const embedUrl = `https://player.videasy.net/tv/${id}/${season}/${episode}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=8B5CF6`;

  //const embedUrl = `https://vidsrc.su/tv/${id}/${season}/${episode}?autoplay=true&colour=00ff9d&autonextepisode=true`;

  // Alternative providers (uncomment if needed)
  // const embedUrl = `https://embed.su/embed/tv/${id}/${season}/${episode}`;
  // const embedUrl = `https://vidbinge.dev/embed/tv/${id}/${season}/${episode}`;
  // const embedUrl = `https://flicky.host/embed/tv/${id}/${season}/${episode}`;

  return <EmbedPlayer url={embedUrl} />;
}

