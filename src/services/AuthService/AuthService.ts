import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  User as FirebaseUser, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          try {
            // Try to fetch user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

            if (userDoc.exists()) {
              const userData = userDoc.data();
              set({
                user: {
                  id: userCredential.user.uid,
                  email: userCredential.user.email || '',
                  name: userData.name || '',
                  photoURL: userData.photoURL || '',
                },
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              // If user document doesn't exist yet, create one with basic info
              try {
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                  email: userCredential.user.email,
                  name: userCredential.user.displayName || '',
                  photoURL: userCredential.user.photoURL || '',
                  createdAt: new Date(),
                });
              } catch (firestoreError) {
                console.error('Failed to create user document:', firestoreError);
                // Continue anyway - user is authenticated
              }
              
              // Authenticate user even if Firestore operations fail
              set({
                user: {
                  id: userCredential.user.uid,
                  email: userCredential.user.email || '',
                  name: userCredential.user.displayName || '',
                  photoURL: userCredential.user.photoURL || '',
                },
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            }
          } catch (firestoreError: any) {
            console.error('Error fetching/creating user data:', firestoreError);
            
            // Still authenticate the user even if Firestore operations fail
            set({
              user: {
                id: userCredential.user.uid,
                email: userCredential.user.email || '',
                name: userCredential.user.displayName || '',
                photoURL: userCredential.user.photoURL || '',
              },
              isAuthenticated: true,
              isLoading: false,
              error: "You're logged in, but some user data couldn't be loaded. You may be offline.",
            });
          }
        } catch (error: any) {
          console.error('Login error:', error);
          
          let errorMessage = 'Failed to login';
          if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your internet connection.';
          } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many login attempts. Please try again later.';
          } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            errorMessage = 'Invalid email or password';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email format';
          } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled';
          }
          
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });
          const provider = new GoogleAuthProvider();
          
          const userCredential = await signInWithPopup(auth, provider);
          
          try {
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              set({
                user: {
                  id: userCredential.user.uid,
                  email: userCredential.user.email || '',
                  name: userData.name || userCredential.user.displayName || '',
                  photoURL: userData.photoURL || userCredential.user.photoURL || '',
                },
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              // If this is the first login, create a user document
              try {
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                  email: userCredential.user.email,
                  name: userCredential.user.displayName || '',
                  photoURL: userCredential.user.photoURL || '',
                  createdAt: new Date(),
                });
              } catch (firestoreError) {
                console.error('Failed to create user document:', firestoreError);
                // Continue anyway - user is authenticated
              }
              
              set({
                user: {
                  id: userCredential.user.uid,
                  email: userCredential.user.email || '',
                  name: userCredential.user.displayName || '',
                  photoURL: userCredential.user.photoURL || '',
                },
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            }
          } catch (firestoreError: any) {
            console.error('Error fetching/creating user data:', firestoreError);
            
            // Still authenticate the user even if Firestore operations fail
            set({
              user: {
                id: userCredential.user.uid,
                email: userCredential.user.email || '',
                name: userCredential.user.displayName || '',
                photoURL: userCredential.user.photoURL || '',
              },
              isAuthenticated: true,
              isLoading: false,
              error: "You're logged in, but some user data couldn't be loaded. You may be offline.",
            });
          }
        } catch (error: any) {
          console.error('Google login error:', error);
          
          let errorMessage = 'Failed to login with Google';
          if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your internet connection.';
          } else if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Login popup was closed. Please try again.';
          } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Login popup was blocked. Please enable popups for this site.';
          } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'Login request was cancelled. Please try again.';
          }
          
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          set({ isLoading: true, error: null });
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Update profile
          await updateProfile(userCredential.user, {
            displayName: name,
          });
          
          // Create user document in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email,
            name,
            photoURL: '',
            createdAt: new Date(),
          });
          
          set({
            user: {
              id: userCredential.user.uid,
              email: userCredential.user.email || '',
              name: name,
              photoURL: '',
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to register',
            isLoading: false,
          });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await signOut(auth);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to logout',
            isLoading: false,
          });
        }
      },

      updateUserProfile: async (data: Partial<User>) => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not authenticated');
          
          set({ isLoading: true, error: null });
          
          // Update Firestore document
          await updateDoc(doc(db, 'users', user.id), {
            ...data,
            updatedAt: new Date(),
          });
          
          // Update user profile in Firebase Auth if name is provided
          if (data.name && auth.currentUser) {
            await updateProfile(auth.currentUser, {
              displayName: data.name,
            });
          }
          
          // Update photoURL in Firebase Auth if provided
          if (data.photoURL && auth.currentUser) {
            await updateProfile(auth.currentUser, {
              photoURL: data.photoURL,
            });
          }
          
          set({
            user: { ...user, ...data },
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to update profile',
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Initialize auth state listener
if (typeof window !== 'undefined') {
  // Check if we have stored auth data already - use it immediately
  const storedAuthData = localStorage.getItem('auth-storage');
  if (storedAuthData) {
    try {
      const parsedData = JSON.parse(storedAuthData);
      if (parsedData.state && parsedData.state.user) {
        // Set initial state from storage immediately to prevent layout shifts
        useAuthStore.setState({
          user: parsedData.state.user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (e) {
      console.error('Error parsing stored auth data:', e);
    }
  }

  // Then set up the listener to update from Firebase
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          useAuthStore.setState({
            user: {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userDoc.data().name || '',
              photoURL: userDoc.data().photoURL || '',
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          useAuthStore.setState({
            user: {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
            },
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error retrieving user document:', error);
        // Still authenticate based on Firebase auth
        useAuthStore.setState({
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
          },
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } else {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  });
  
  // Clean up listener on page unload
  window.addEventListener('beforeunload', () => unsubscribe());
}

// Default export for the AuthService
const AuthService = {
  useAuthStore
};

export default AuthService;
