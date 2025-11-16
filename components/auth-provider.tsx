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
  const [isHydrated, setIsHydrated] = useState(false); // Track client hydration
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
    // Mark as hydrated immediately
    setIsHydrated(true);
    
    // Use server data as source of truth initially
    setUser(initialUser);
    setProfile(initialProfile);
    lastPathnameRef.current = pathname;
    
    // ✅ Check for existing session on mount (in case server data is stale)
    // ✅ Special handling for admin accounts - always refresh profile
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Session check error:', error);
          }
          // If there's an error but we have initialUser, keep it
          if (!initialUser) {
            setUser(null);
            setProfile(null);
          }
          return;
        }
        
        // No session found
        if (!session?.user) {
          // Only clear if we don't have initial user from server
          if (!initialUser) {
            setUser(null);
            setProfile(null);
          }
          return;
        }
        
        // Session exists
        const sessionUser = session.user;
        
        // If we have a session but no initial user, update state
        if (!initialUser) {
          setUser(sessionUser);
          await fetchUserProfile(sessionUser, true);
        }
        // If user IDs don't match, use session user (more up-to-date)
        else if (initialUser.id !== sessionUser.id) {
          setUser(sessionUser);
          await fetchUserProfile(sessionUser, true);
        }
        // Same user - check if we need to refresh profile
        else {
          // Always refresh profile for admin accounts to ensure latest permissions
          if (initialProfile?.is_admin || initialProfile?.role === 'admin') {
            await fetchUserProfile(sessionUser, true);
          }
          // For regular users, only refresh if profile is missing
          else if (!initialProfile) {
            await fetchUserProfile(sessionUser, true);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Session check exception:', error);
        }
        // Keep initial data on error
      } finally {
        // Mark initial load as complete
        setInitialLoad(false);
      }
    };
    
    // Small delay to prevent flicker
    const timer = setTimeout(checkSession, 50);
    return () => clearTimeout(timer);
  }, []); // Empty deps - only run once on mount

  // Auth state change listener - OPTIMIZED FOR NO FLICKER
  useEffect(() => {
    // Don't set up listener until hydrated
    if (!isHydrated) return;
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignore initial session event to prevent flicker
      if (event === 'INITIAL_SESSION') {
        return;
      }
      
      // Only show loading for SIGNED_IN and SIGNED_OUT (not TOKEN_REFRESHED)
      const shouldShowLoading = event === 'SIGNED_IN' || event === 'SIGNED_OUT';
      if (shouldShowLoading) {
        setLoading(true);
      }
      
      const currentUser = session?.user ?? null;
      
      // Only update user if it actually changed
      setUser((prev: User | null) => {
        // If user ID is the same, keep the previous object to prevent re-renders
        if (prev?.id === currentUser?.id) return prev;
        return currentUser;
      });
      
      if (currentUser) {
        // Fetch profile silently (without loading state for token refresh)
        const shouldForceRefresh = event === 'SIGNED_IN' || event === 'USER_UPDATED';
        const profileData = await fetchUserProfile(currentUser, shouldForceRefresh);
        if (profileData) {
          setProfile((prev: any) => {
            // Only update if data actually changed
            if (JSON.stringify(prev) === JSON.stringify(profileData)) return prev;
            return profileData;
          });
        }
      } else {
        setProfile(null);
        profileFetchRef.current.clear();
      }
      
      if (shouldShowLoading) {
        setLoading(false);
      }
      setInitialLoad(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile, isHydrated]);

  // DISABLED: Pathname-based profile refresh - causes flicker
  // Profile is refreshed on auth state changes only
  // This prevents unnecessary re-renders and loading states on navigation

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
