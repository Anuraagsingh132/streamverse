'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import UserService, { WatchlistItem } from '@/services/UserService/UserService';
import { useAuthStore } from '@/services/AuthService/AuthService';
import { useEffect, useState, useCallback, useRef } from 'react';
import { MediaType } from '@/types';
import { toast } from 'sonner';
import { getSlug } from '@/lib/utils';
import CustomImage from '@/components/custom-image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WatchLaterPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Track if initial preload happened
  const preloadRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Effect to check visibility changes and refresh data when tab becomes visible
  useEffect(() => {
    if (!isMounted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && user) {
        // Silent refresh when tab becomes visible again
        void fetchWatchlist(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMounted, isAuthenticated, user]);

  useEffect(() => {
    if (!isMounted) return;

    if (isAuthenticated && user) {
      void fetchWatchlist();
    } else {
      setIsLoading(false);
      setWatchlist([]);
      if (isAuthenticated === false) {
        setError('Please log in to view your Watch Later list');
      }
    }
  }, [isMounted, isAuthenticated, user]);

  // Function to fetch the watchlater
  const fetchWatchlist = useCallback(async (showLoading = true) => {
    if (!user || !isAuthenticated) return;

    try {
      if (showLoading) {
        setIsLoading(true);
        setError(null);
      }
      const data = await UserService.getWatchlist(user.id, true);
      setWatchlist(data);
      return data;
    } catch (error) {
      console.error('Error loading watchlater:', error);
      setError('Failed to load your Watch Later list');
      return [];
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
      preloadRef.current = true;
    }
  }, [user, isAuthenticated]);

  // Function to handle removing an item from the watchlater
  const handleRemove = useCallback(async (itemId: string) => {
    if (!user) return;
    
    setLoadingItemId(itemId);
    
    try {
      await UserService.removeFromWatchlist(user.id, itemId);
      setWatchlist(prev => prev.filter(item => item.id !== itemId));
      toast.success('Removed from Watch Later');
    } catch (error) {
      console.error('Error removing from watchlater:', error);
      toast.error('Failed to remove from Watch Later');
    } finally {
      setLoadingItemId(null);
    }
  }, [user]);

  // Handle opening the details page
  const handleOpenDetails = (item: WatchlistItem) => {
    const mediaType = item.mediaType || 'movie';
    const slug = getSlug(item.movieId, item.title);
    
    if (mediaType === 'movie') {
      router.push(`/movies/${slug}`);
    } else {
      router.push(`/tv-shows/${slug}`);
    }
  };

  // Handle playing the show
  const handlePlayShow = useCallback((item: WatchlistItem) => {
    const mediaType: MediaType = item.mediaType || 'movie';
    
    // Navigate directly to watch URL instead of opening modal
    const watchUrl = `/watch/${mediaType}/${item.movieId}`;
    router.push(watchUrl);
  }, [router]);

  if (!isMounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="container mx-auto py-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold">Watch Later</h1>
        <p className="text-muted-foreground">
          Your saved shows and movies to watch later
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Icons.spinner className="h-10 w-10 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Icons.warning className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">{error}</p>
          {!isAuthenticated && (
            <Button 
              onClick={() => document.getElementById('login-button')?.click()}
              variant="secondary"
            >
              Log In
            </Button>
          )}
        </div>
      ) : watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Icons.film className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Your Watch Later list is empty</p>
          <Button 
            onClick={() => router.push('/home')}
            variant="secondary"
          >
            Browse Shows
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
          {watchlist.map((item) => (
            <div key={item.id} className="group relative rounded-lg overflow-hidden bg-black aspect-[2/3] shadow-md transition-all hover:scale-105 cursor-pointer">
              {/* Card content */}
              <div onClick={() => handleOpenDetails(item)}>
                <CustomImage
                  src={
                    item.posterPath
                      ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
                      : '/images/grey-thumbnail.jpg'
                  }
                  alt={item.title || 'Movie poster'}
                  className="h-full w-full object-cover transition-all duration-300 group-hover:opacity-70"
                  width={300}
                  height={450}
                />
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-3">
                  <h3 className="text-sm font-medium line-clamp-1 text-white">
                    {item.title || 'Unknown title'}
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    Added: {new Intl.DateTimeFormat('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }).format(new Date(item.addedAt))}
                  </p>
                </div>
              </div>
              
              {/* Overlay buttons */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayShow(item);
                  }}
                  size="sm"
                  className="rounded-full w-12 h-12 p-0"
                >
                  <Icons.play className="h-5 w-5" />
                  <span className="sr-only">Play</span>
                </Button>
                
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.id);
                  }}
                  size="sm"
                  variant="destructive"
                  disabled={loadingItemId === item.id}
                  className="rounded-full w-12 h-12 p-0"
                >
                  {loadingItemId === item.id ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.trash className="h-4 w-4" />
                  )}
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
              
              {/* Media type badge */}
              <div className="absolute top-2 right-2">
                <span className="bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                  {item.mediaType === 'tv' ? 'TV' : 'Movie'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
