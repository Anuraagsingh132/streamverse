'use client';

import React, { Suspense } from 'react';
import EmbedPlayer from '@/components/watch/embed-player';
import { useSearchParams } from 'next/navigation';

function TvPlayer({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  const embedUrl = `https://player.videasy.net/tv/${id}/${season}/${episode}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=8B5CF6`;

  return <EmbedPlayer url={embedUrl} />;
}

export default function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop();
  
  if (!id) return null;

  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      <TvPlayer id={id} />
    </Suspense>
  );
}

