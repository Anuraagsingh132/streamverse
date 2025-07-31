import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';

export const revalidate = 3600;

export default function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop();

  // Example with vidbinge.dev
  return <EmbedPlayer url={`https://vidsrc.su/embed/movie/${id}`} />;
  //return <EmbedPlayer url={`https://flicky.host/embed/movie/?id=${id}`} />;
  //return <EmbedPlayer url={`https://vidbinge.dev/embed/movie/${id}`} />;
  //return <EmbedPlayer url={`https://vidlink.pro/movie/${id}?primaryColor=63b8bc&secondaryColor=a2a2a2&iconColor=eefdec&icons=vid&player=default&title=true&poster=true&autoplay=true&nextbutton=false`} />;

  // You can switch between these options by uncommenting the desired line:
  //return <EmbedPlayer url={`https://embed.su/embed/movie/${id}`} />;
  //return <EmbedPlayer url={`https://player.vidsrc.nl/embed/movie/${id}`} />;
  //return <EmbedPlayer url={`https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`} />;
  // return <EmbedPlayer url={`https://vidsrc.me/embed/movie/${id}?autoPlay=true`} />;
}
