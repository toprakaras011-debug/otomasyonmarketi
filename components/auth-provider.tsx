'use client';

import { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true 
});

// Inactivity timeout: 30 minutes (1800000 ms) - Only logout if truly inactive
// Note: Supabase handles token refresh automatically, so we don't need aggressive timeouts
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ 
  children, 
  initialUser, 
  initialProfile 
}: { 
  children: ReactNode, 
  initialUser: User | null, 
  initialProfile: any 
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<any>(initialProfile);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // Track initial load separately
  const profileFetchRef = useRef<Map<string, Promise<any>>>(new Map());
  const lastPathnameRef = useRef<string>('');
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const fetchUserProfile = useCallback(async (user: User, force = false) => {
    // Prevent duplicate fetches
    const cacheKey = `${user.id}-${pathname}`;
    if (!force && profileFetchRef.current.has(cacheKey)) {
      return profileFetchRef.current.get(cacheKey);
    }

    const fetchPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id,username,avatar_url,role,is_admin,is_developer,developer_approved')
          .eq('id', user.id)
          .maybeSingle(); // ✅ Use maybeSingle instead of single to handle missing profiles gracefully
        
        if (error) {
          console.error('Profile fetch error:', error);
          // ✅ Admin hesapları için özel hata yönetimi
          if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
            // Profile bulunamadı - bu normal olabilir, null döndür
            setProfile(null);
            return null;
          }
          // Diğer hatalar için de null döndür ama log'la
          setProfile(null);
          return null;
        } else {
          setProfile(data);
          return data;
        }
      } catch (error) {
        console.error('Profile fetch exception:', error);
        setProfile(null);
        return null;
      } finally {
        // Clean up cache after 5 seconds
        setTimeout(() => {
          profileFetchRef.current.delete(cacheKey);
        }, 5000);
      }
    })();

    profileFetchRef.current.set(cacheKey, fetchPromise);
    return fetchPromise;
  }, [pathname]);

  // Initialize with server data and check for existing session
  useEffect(() => {
    setUser(initialUser);
    setProfile(initialProfile);
    lastPathnameRef.current = pathname;
    
    // ✅ Check for existing session on mount (in case server data is stale)
    // ✅ Special handling for admin accounts - always refresh profile
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.user) {
          // If we have a session but no initial user, update state
          if (!initialUser && session.user) {
            setUser(session.user);
            await fetchUserProfile(session.user, true);
          }
          // If we have both, ensure they match
          else if (initialUser && session.user && initialUser.id !== session.user.id) {
            setUser(session.user);
            await fetchUserProfile(session.user, true);
          }
          // ✅ Always refresh profile for admin accounts to ensure admin status is up-to-date
          else if (initialUser && session.user && initialUser.id === session.user.id) {
            // Check if user is admin and refresh profile
            // Use initialProfile from server-side, or check if we need to refresh
            if (initialProfile?.is_admin || initialProfile?.role === 'admin') {
              // Always refresh admin profile to ensure latest permissions
              await fetchUserProfile(session.user, true);
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Session check error:', error);
        }
      } finally {
        // Mark initial load as complete
        setInitialLoad(false);
      }
    };
    
    checkSession();
  }, [initialUser, fetchUserProfile]);

  // Auth state change listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state changed:', event, session?.user?.id);
      }
      
      // Only show loading for significant auth events (sign in, sign out)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setLoading(true);
      }
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Always fetch profile on auth state change to ensure it's fresh
        // ✅ Especially important for admin accounts
        const profileData = await fetchUserProfile(currentUser, true);
        // ✅ Double-check admin status if profile was fetched
        if (profileData && (profileData.is_admin || profileData.role === 'admin')) {
          // Ensure admin status is properly set
          setProfile(profileData);
        }
      } else {
        setProfile(null);
        profileFetchRef.current.clear();
      }
      
      setLoading(false);
      setInitialLoad(false); // Mark initial load as complete
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Refresh profile on pathname change (only if pathname actually changed)
  // DISABLED: This was causing constant profile fetches and loading states
  // Profile is already cached and refreshed on auth state changes
  // Only refresh if explicitly needed (e.g., after profile update)
  useEffect(() => {
    // Skip if initial load is not complete
    if (initialLoad) return;
    
    // Only refresh on specific pathname changes (e.g., profile settings)
    // Don't refresh on every navigation
    if (user && pathname && pathname !== lastPathnameRef.current) {
      lastPathnameRef.current = pathname;
      
      // Only refresh if we're on a page that might have updated the profile
      const profileRelatedPaths = ['/dashboard/settings', '/profile', '/developer/dashboard'];
      const shouldRefresh = profileRelatedPaths.some(path => pathname.startsWith(path));
      
      if (shouldRefresh) {
        // Debounce profile refresh
        const timeoutId = setTimeout(() => {
          fetchUserProfile(user, false);
        }, 500); // Increased debounce time
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [pathname, user, fetchUserProfile, initialLoad]);

  // Inactivity detection and auto-logout
  // DISABLED: Supabase handles session management automatically with autoRefreshToken
  // Only enable if you want to force logout after extended inactivity
  useEffect(() => {
    if (!user) {
      // Clear timer if user is not logged in
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    // DISABLED: Auto-logout on inactivity
    // Supabase automatically refreshes tokens and manages sessions
    // This was causing users to be logged out too aggressively
    // If you want to re-enable, uncomment below and adjust INACTIVITY_TIMEOUT
    
    /*
    // Reset activity timestamp
    const resetInactivityTimer = () => {
      lastActivityRef.current = Date.now();
      
      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // Set new timer
      inactivityTimerRef.current = setTimeout(async () => {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        
        // Double-check: if more than timeout has passed, logout
        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
          try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            profileFetchRef.current.clear();
            
            // Redirect to home page
            if (pathname && !pathname.startsWith('/auth')) {
              router.push('/');
            }
          } catch (error) {
            console.error('Auto-logout error:', error);
          }
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Track user activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Initialize timer
    resetInactivityTimer();

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
    */
  }, [user, pathname, router]);

  const value = useMemo(() => ({ user, profile, loading }), [user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
