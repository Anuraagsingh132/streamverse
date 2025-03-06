'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/services/AuthService';
import UserService from '@/services/UserService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons';

interface WatchlistItem {
  id: string;
  title: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  overview: string;
  addedAt: Date;
}

export default function WatchlistPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/watchlist');
    }
    
    const fetchWatchlist = async () => {
      setIsLoadingWatchlist(true);
      try {
        if (user?.id) {
          const items = await UserService.getWatchlist(user.id);
          const transformedItems: WatchlistItem[] = items.map(item => ({
            id: item.id,
            title: item.title,
            poster_path: item.posterPath,
            media_type: 'movie', // Default to movie if not specified
            overview: '', // Default empty overview
            addedAt: item.addedAt,
          }));
          setWatchlist(transformedItems);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load watchlater');
      } finally {
        setIsLoadingWatchlist(false);
      }
    };
    
    if (isAuthenticated && !isLoading) {
      fetchWatchlist();
    }
  }, [isAuthenticated, isLoading, user]);

  const handleRemoveFromWatchlist = async (itemId: string) => {
    if (!user?.id) return;
    
    try {
      await UserService.removeFromWatchlist(user.id, itemId);
      // Filter out the removed item from state
      setWatchlist(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item from watchlater:', error);
    }
  };

  if (isLoading || isLoadingWatchlist) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
      
      {error && (
        <div className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200 p-3 rounded-md text-sm mb-6">
          {error}
        </div>
      )}
      
      {watchlist.length === 0 ? (
        <div className="text-center py-16">
          <Icons.bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Start adding movies and TV shows to your watchlist to keep track of what you want to watch.
          </p>
          <Button asChild>
            <Link href="/">Browse Content</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchlist.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.png'}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveFromWatchlist(item.id)}
                >
                  <Icons.trash className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <Link href={`/${item.media_type}/${item.id}`}>
                  <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground mb-2">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </p>
                <p className="text-sm line-clamp-2">{item.overview}</p>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/${item.media_type}/${item.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/watch/${item.media_type}/${item.id}`}>
                      <Icons.play className="mr-1 h-4 w-4" />
                      Watch Now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
