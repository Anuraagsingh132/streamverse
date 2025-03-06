'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/services/AuthService';
import UserService from '@/services/UserService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';

interface HistoryItem {
  id: string;
  title: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  overview: string;
  watchedAt: Date;
  progress: number;
  duration: number;
  season?: number;
  episode?: number;
}

export default function HistoryPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/history');
    }
    
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        if (user?.id) {
          const items = await UserService.getWatchHistory(user.id);
          const transformedItems: HistoryItem[] = items.map(item => ({
            id: item.id,
            title: item.title,
            poster_path: item.posterPath,
            media_type: 'movie', // Default to movie if not specified
            overview: '', // Default empty overview
            watchedAt: item.watchedAt,
            progress: item.progress || 0,
            duration: 0, // Default duration
          }));
          setHistory(transformedItems);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load watch history');
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    if (isAuthenticated && !isLoading) {
      fetchHistory();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleClearHistoryItem = async (itemId: string) => {
    if (!user?.id) return;
    
    try {
      await UserService.removeFromWatchHistory(user.id, itemId);
      setHistory(prev => prev.filter(item => item.id !== itemId));
    } catch (error: any) {
      setError(error.message || 'Failed to remove from history');
    }
  };

  const handleClearAllHistory = async () => {
    if (!user?.id) return;
    
    try {
      await UserService.clearWatchHistory(user.id);
      setHistory([]);
    } catch (error: any) {
      setError(error.message || 'Failed to clear history');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatProgress = (progress: number, duration: number) => {
    const watchedSeconds = Math.floor((progress / 100) * duration);
    return formatTime(watchedSeconds);
  };

  if (isLoading || isLoadingHistory) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Watch History</h1>
        {history.length > 0 && (
          <Button variant="outline" onClick={handleClearAllHistory}>
            Clear All History
          </Button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200 p-3 rounded-md text-sm mb-6">
          {error}
        </div>
      )}
      
      {history.length === 0 ? (
        <div className="text-center py-16">
          <Icons.history className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Your watch history is empty</h2>
          <p className="text-muted-foreground mb-6">
            Start watching movies and TV shows to build your watch history.
          </p>
          <Button asChild>
            <Link href="/">Browse Content</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-48 aspect-video md:aspect-[2/3]">
                  <Image
                    src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.png'}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/${item.media_type}/${item.id}`}>
                        <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mb-2">
                        Watched {new Date(item.watchedAt).toLocaleDateString()} at {new Date(item.watchedAt).toLocaleTimeString()}
                      </p>
                      {item.media_type === 'tv' && item.season && item.episode && (
                        <p className="text-sm font-medium mb-2">
                          Season {item.season}, Episode {item.episode}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleClearHistoryItem(item.id)}
                    >
                      <Icons.trash className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm line-clamp-2 mb-4">{item.overview}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {item.progress}%</span>
                      <span>{formatProgress(item.progress, item.duration)} / {formatTime(item.duration)}</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${item.media_type}/${item.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="default" size="sm" asChild>
                      <Link href={`/watch/${item.media_type}/${item.id}`}>
                        <Icons.play className="mr-1 h-4 w-4" />
                        {item.progress > 0 && item.progress < 95 ? 'Continue Watching' : 'Watch Again'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
