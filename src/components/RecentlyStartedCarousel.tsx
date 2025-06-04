'use client';

import React, { useEffect, useState } from 'react';
import ShowsCarousel from './shows-carousel';
import { MediaType } from '@/types'; // Assuming shows-carousel can handle the WatchedItem[] type
import { getRecents, WatchedItem } from '@/lib/localStorageUtils';

interface RecentlyStartedCarouselProps {
  mediaTypeFilter?: MediaType;
}

const RecentlyStartedCarousel = ({ mediaTypeFilter }: RecentlyStartedCarouselProps) => {
  const [recents, setRecents] = useState<WatchedItem[]>([]);

  useEffect(() => {
    let fetchedRecents = getRecents();
    if (mediaTypeFilter) {
      fetchedRecents = fetchedRecents.filter(item => item.media_type === mediaTypeFilter);
    }
    setRecents(fetchedRecents);
  }, []);

  if (recents.length === 0) {
    return null; // Don't render anything if there are no recents
  }

  return (
    <ShowsCarousel title="Recently Started" shows={recents} />
  );
};

export default RecentlyStartedCarousel;
