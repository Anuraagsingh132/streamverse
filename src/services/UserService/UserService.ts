import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  orderBy, 
  limit,
  writeBatch
} from 'firebase/firestore';
import { useAuthStore } from '../AuthService/AuthService';

export interface WatchlistItem {
  id: string;
  movieId: number;
  title: string;
  posterPath: string;
  addedAt: Date;
}

export interface WatchHistoryItem {
  id: string;
  movieId: number;
  title: string;
  posterPath: string;
  watchedAt: Date;
  progress?: number; // Progress in percentage
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  autoplay: boolean;
}

export class UserService {
  private static instance: UserService;
  private watchlistCache: Map<string, { data: WatchlistItem[], timestamp: number }> = new Map();
  // Increase cache lifetime to 2 minutes for better performance
  private CACHE_TTL = 2 * 60 * 1000; // 2 minutes
  private eagerLoadedItems: Map<string, boolean> = new Map(); // Track which user's data is preloaded

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Preload watchlater for faster access
  async preloadWatchlist(userId: string): Promise<void> {
    if (this.eagerLoadedItems.get(userId)) return;
    
    try {
      // Fetch watchlater in background
      this.getWatchlist(userId).then(() => {
        this.eagerLoadedItems.set(userId, true);
      });
    } catch (error) {
      console.error('Error preloading watchlater:', error);
    }
  }

  /**
   * Get the user's watchlater from Firestore
   * This list is synchronized across all devices where the user is signed in
   */
  async getWatchlist(userId: string, forceRefresh = false): Promise<WatchlistItem[]> {
    // Check cache first for faster response
    const cached = this.watchlistCache.get(userId);
    const now = Date.now();
    
    if (!forceRefresh && cached && (now - cached.timestamp < this.CACHE_TTL)) {
      // Return cached data if fresh
      return cached.data;
    }
    
    try {
      const watchlistRef = collection(db, 'users', userId, 'watchlater');
      const q = query(watchlistRef, orderBy('addedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toDate() || new Date(),
        movieId: Number(doc.data().movieId)
      } as WatchlistItem));
      
      // Update cache with new data
      this.watchlistCache.set(userId, { data: items, timestamp: now });
      
      return items;
    } catch (error) {
      console.error('Error fetching watchlater:', error);
      
      // If cache exists, return cached data as fallback
      if (cached) {
        return cached.data;
      }
      
      throw error;
    }
  }

  /**
   * Check if a movie is in the user's watchlater
   * Uses cached data when available for performance
   */
  async isInWatchlist(userId: string, movieId: string | number): Promise<boolean> {
    if (!userId) return false;
    
    // Use cache if available for faster lookups
    const cached = this.watchlistCache.get(userId);
    if (cached) {
      const existsInCache = cached.data.some(item => 
        Number(item.movieId) === Number(movieId)
      );
      if (existsInCache) return true;
    }

    // Only check Firestore if not found in cache
    try {
      const watchlistRef = collection(db, 'users', userId, 'watchlater');
      const q = query(watchlistRef, where('movieId', '==', Number(movieId)), limit(1));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking watchlater:', error);
      return false;
    }
  }

  /**
   * Add an item to the user's watchlater
   * This will be synchronized across all devices where the user is signed in
   */
  async addToWatchlist(userId: string, item: Omit<WatchlistItem, 'id' | 'addedAt'>): Promise<string> {
    try {
      // Skip existence check for speed - just add it directly
      // The duplicate check will happen server-side with Firestore rules
      const watchlistRef = collection(db, 'users', userId, 'watchlater');
      const newItem = {
        ...item,
        movieId: Number(item.movieId),
        addedAt: new Date(),
      };
      
      const docRef = await addDoc(watchlistRef, newItem);
      
      // Update cache directly for immediate response
      const cached = this.watchlistCache.get(userId);
      if (cached) {
        const updatedCache = [{
          id: docRef.id,
          ...newItem,
        }, ...cached.data];
        
        this.watchlistCache.set(userId, {
          data: updatedCache,
          timestamp: Date.now()
        });
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding to watchlater:', error);
      throw error;
    }
  }

  /**
   * Remove an item from the user's watchlater
   * This will be synchronized across all devices where the user is signed in
   */
  async removeFromWatchlist(userId: string, itemId: string): Promise<void> {
    try {
      // Immediately update cache for faster UI response
      const cached = this.watchlistCache.get(userId);
      if (cached) {
        const updatedCache = cached.data.filter(item => item.id !== itemId);
        this.watchlistCache.set(userId, {
          data: updatedCache,
          timestamp: Date.now()
        });
      }
      
      // Delete from Firestore in the background
      const itemRef = doc(db, 'users', userId, 'watchlater', itemId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error('Error removing from watchlater:', error);
      throw error;
    }
  }

  /**
   * Force refresh the watchlater from Firestore
   * Useful when switching devices or after a period of inactivity
   */
  async refreshWatchlist(userId: string): Promise<WatchlistItem[]> {
    return this.getWatchlist(userId, true);
  }

  // Watch History Methods
  async getWatchHistory(userId: string, limitCount = 20): Promise<WatchHistoryItem[]> {
    try {
      const historyRef = collection(db, 'users', userId, 'watchHistory');
      const q = query(historyRef, orderBy('watchedAt', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        watchedAt: doc.data().watchedAt?.toDate() || new Date(),
      } as WatchHistoryItem));
    } catch (error) {
      console.error('Error getting watch history:', error);
      throw error;
    }
  }

  async addToWatchHistory(userId: string, item: Omit<WatchHistoryItem, 'id' | 'watchedAt'>): Promise<string> {
    try {
      const historyRef = collection(db, 'users', userId, 'watchHistory');
      
      // Add to watch history
      const docRef = await addDoc(historyRef, {
        ...item,
        watchedAt: new Date(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding to watch history:', error);
      throw error;
    }
  }

  async removeFromWatchHistory(userId: string, itemId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId, 'watchHistory', itemId));
    } catch (error) {
      console.error('Error removing from watch history:', error);
      throw error;
    }
  }

  async clearWatchHistory(userId: string): Promise<void> {
    try {
      const historyRef = collection(db, 'users', userId, 'watchHistory');
      const querySnapshot = await getDocs(historyRef);
      
      const batch = writeBatch(db);
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error clearing watch history:', error);
      throw error;
    }
  }

  async updateWatchProgress(userId: string, historyItemId: string, progress: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId, 'watchHistory', historyItemId), {
        progress,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating watch progress:', error);
      throw error;
    }
  }

  // User Settings Methods
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().settings) {
        return docSnap.data().settings as UserSettings;
      }
      
      // Return default settings if none exist
      return {
        theme: 'system',
        emailNotifications: true,
        autoplay: true
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const currentSettings = userDoc.data().settings || {
          theme: 'system',
          emailNotifications: true,
          autoplay: true
        };
        
        await updateDoc(userDocRef, {
          settings: {
            ...currentSettings,
            ...settings
          },
          updatedAt: new Date()
        });
      } else {
        await setDoc(userDocRef, {
          settings: {
            theme: 'system',
            emailNotifications: true,
            autoplay: true,
            ...settings
          },
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // User Profile Methods
  async getUserProfile(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, data: any) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export default UserService.getInstance();
