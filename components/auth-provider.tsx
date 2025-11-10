'use client';

import { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
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
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<any>(initialProfile);
  const [loading, setLoading] = useState(false);
  const profileFetchRef = useRef<Map<string, Promise<any>>>(new Map());
  const lastPathnameRef = useRef<string>('');

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
          .single();
        
        if (error) {
          console.error('Profile fetch error:', error);
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

  // Initialize with server data
  useEffect(() => {
    setUser(initialUser);
    setProfile(initialProfile);
    lastPathnameRef.current = pathname;
  }, []);

  // Auth state change listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Always fetch profile on auth state change to ensure it's fresh
        await fetchUserProfile(currentUser, true);
      } else {
        setProfile(null);
        profileFetchRef.current.clear();
      }
      
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Refresh profile on pathname change (only if pathname actually changed)
  useEffect(() => {
    if (user && pathname && pathname !== lastPathnameRef.current) {
      lastPathnameRef.current = pathname;
      // Debounce profile refresh
      const timeoutId = setTimeout(() => {
        fetchUserProfile(user, false);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [pathname, user, fetchUserProfile]);

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
