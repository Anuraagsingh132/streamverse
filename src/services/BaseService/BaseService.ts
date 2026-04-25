import { env } from '@/env.mjs';

/**
 * @class BaseService
 */
class BaseService {
  constructor() {
    if (this.constructor === BaseService) {
      throw new Error("Classes can't be instantiated.");
    }
  }

  static async fetch<T>(baseUrl: string, endpoint: string, init?: RequestInit): Promise<{ data: T }> {
    const url = `${baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((init?.headers as Record<string, string>) || {}),
    };

    if (url.includes('themoviedb')) {
      headers['Authorization'] = `Bearer ${env.NEXT_PUBLIC_TMDB_TOKEN}`;
    }

    const mergedInit: RequestInit = {
      ...init,
      headers,
      next: { revalidate: 3600, ...init?.next }, // 1 hour cache by default
    };

    try {
      const response = await fetch(url, mergedInit);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} url: ${url}`);
      }
      const data = await response.json() as T;
      return { data }; // Mimic axios response structure
    } catch (error) {
      console.error(`error in request: ${(error as Error).message}`);
      throw error;
    }
  }

  static isRejected = (
    input: PromiseSettledResult<unknown>,
  ): input is PromiseRejectedResult => input.status === 'rejected';

  static isFulfilled = <T>(
    input: PromiseSettledResult<T>,
  ): input is PromiseFulfilledResult<T> => input.status === 'fulfilled';
}

export default BaseService;
