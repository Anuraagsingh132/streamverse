'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/services/AuthService/AuthService';
import UserService, { WatchlistItem } from '@/services/UserService/UserService';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useModalStore } from '@/stores/modal';
import { MediaType } from '@/types';
import { toast } from 'sonner';
import CustomImage from '@/components/custom-image';
import Link from 'next/link';
import { getSlug } from '@/lib/utils';

export default function WatchLaterSection() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const openWatchLaterModalStore = useModalStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadWatchlist();
    } else {
      setIsLoading(false);
      setWatchlist([]);
    }
  }, [isAuthenticated, user]);

  const loadWatchlist = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await UserService.getWatchlist(user.id, true);
      // Show only the 4 most recent items
      setWatchlist(data.slice(0, 4));
    } catch (error) {
      console.error('Error loading watchlater:', error);
      toast.error('Failed to load your Watch Later list');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayShow = (item: WatchlistItem) => {
    const mediaType: MediaType = item.mediaType || 'movie';
    
    // Navigate directly to watch URL instead of opening modal
    const watchUrl = `/watch/${mediaType}/${item.movieId}`;
    window.location.href = watchUrl;
  };

  // If not authenticated or no items, don't show anything
  if (!isAuthenticated || (!isLoading && watchlist.length === 0)) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Continue Watching</h2>
        <Link 
          href="/watch-later"
          className="text-sm text-blue-500 hover:underline flex items-center"
        >
          View All <Icons.chevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {watchlist.map((item) => (
            <div key={item.id} className="group relative rounded-md overflow-hidden bg-black aspect-video">
              <CustomImage
                src={
                  item.posterPath
                    ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
                    : '/images/grey-thumbnail.jpg'
                }
                alt={item.title || 'Movie poster'}
                className="h-full w-full object-cover transition-all duration-300 group-hover:opacity-50"
                width={500}
                height={281}
              />
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => handlePlayShow(item)}
                    size="sm"
                    className="text-xs"
                  >
                    <Icons.play className="mr-1 h-3 w-3" />
                    Play
                  </Button>
                </div>
              </div>
              
              <div className="p-2 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent">
                <Link 
                  href={`/${item.mediaType || 'movie'}/${item.movieId}/${getSlug(item.movieId, item.title)}`} 
                  className="text-sm font-medium line-clamp-1 hover:underline text-white"
                >
                  {item.title || 'Unknown title'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
