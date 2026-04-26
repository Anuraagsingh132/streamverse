import { type Show, MediaType } from '@/types/index';
import MovieService from '@/services/MovieService';

/**
 * A client-side singleton cache for prefetched show details.
 * Data is fetched in the background (on hover or during idle time)
 * so that opening a modal feels instantaneous.
 */
class ShowPrefetchCache {
  private cache = new Map<string, Show>();
  private inflight = new Map<string, Promise<Show | null>>();

  private key(id: number, type: MediaType): string {
    return `${id}-${type}`;
  }

  /** Check if a show's details are already cached */
  has(id: number, type: MediaType): boolean {
    return this.cache.has(this.key(id, type));
  }

  /** Get a cached show (or null if not cached) */
  get(id: number, type: MediaType): Show | null {
    return this.cache.get(this.key(id, type)) ?? null;
  }

  /**
   * Prefetch a show's details in the background.
   * - Deduplicates concurrent requests for the same show.
   * - Silently catches errors (this is speculative prefetch, not critical).
   */
  async prefetch(id: number, type: MediaType): Promise<Show | null> {
    const k = this.key(id, type);

    // Already cached
    if (this.cache.has(k)) return this.cache.get(k)!;

    // Already in-flight
    if (this.inflight.has(k)) return this.inflight.get(k)!;

    const promise = (async () => {
      try {
        const response =
          type === MediaType.TV
            ? await MovieService.findTvSeries(id)
            : await MovieService.findMovie(id);
        const data = response.data;
        if (data) {
          const show: Show = { ...data, media_type: type };
          this.cache.set(k, show);
          return show;
        }
        return null;
      } catch {
        // Prefetch is best-effort; swallow errors silently
        return null;
      } finally {
        this.inflight.delete(k);
      }
    })();

    this.inflight.set(k, promise);
    return promise;
  }

  /**
   * Prefetch a batch of shows during browser idle time.
   * Staggers requests to avoid hammering the API.
   */
  prefetchBatch(shows: Array<{ id: number; media_type: MediaType }>): void {
    if (typeof window === 'undefined') return;

    const uncached = shows.filter((s) => !this.has(s.id, s.media_type));
    if (uncached.length === 0) return;

    let index = 0;
    const BATCH_SIZE = 3; // concurrent prefetches per tick
    const INTERVAL_MS = 800; // delay between batches

    const processBatch = () => {
      const batch = uncached.slice(index, index + BATCH_SIZE);
      if (batch.length === 0) return;

      batch.forEach((s) => void this.prefetch(s.id, s.media_type));
      index += BATCH_SIZE;

      if (index < uncached.length) {
        // Use requestIdleCallback if available, else setTimeout
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            setTimeout(processBatch, INTERVAL_MS);
          });
        } else {
          setTimeout(processBatch, INTERVAL_MS);
        }
      }
    };

    // Start after a generous delay so images/paint finishes first
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => processBatch(), { timeout: 5000 });
    } else {
      setTimeout(processBatch, 3000);
    }
  }

  /** Clear all cached data */
  clear(): void {
    this.cache.clear();
    this.inflight.clear();
  }
}

// Export a singleton instance
export const showPrefetchCache = new ShowPrefetchCache();
