import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';

export const revalidate = 3600;

export default function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop();
  //return <EmbedPlayer url={`https://embed.su/embed/movie/${id}`} />;
  return <EmbedPlayer url={`https://vidbinge.dev/embed/movie/${id}`} />;
  //return <EmbedPlayer url={`https://player.vidsrc.nl/embed/movie/${id}`} />;
  //return <EmbedPlayer url={`https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`} />;
  //return <EmbedPlayer url={`https://vidsrc.me/embed/movie/${id}?autoPlay=true`} />;
  
}
