'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

  useEffect(() => {
    const fetchUserProfile = async (user: User) => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id,username,avatar_url,role,is_admin,is_developer,developer_approved')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Profile fetch error:', error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Profile fetch exception:', error);
        setProfile(null);
      }
    };

    // Set initial user and profile
    setUser(initialUser);
    setProfile(initialProfile);

    // Always fetch profile if we have a user (to ensure it's up to date, especially after navigation)
    // Fetch immediately for admin detection
    if (initialUser) {
      fetchUserProfile(initialUser);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [initialUser, initialProfile]);

  // Refresh profile when pathname changes (to ensure profile is up to date after navigation)
  useEffect(() => {
    if (user && pathname) {
      const refreshProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('id,username,avatar_url,role,is_admin,is_developer,developer_approved')
            .eq('id', user.id)
            .single();
          
          if (!error && data) {
            setProfile(data);
          }
        } catch (error) {
          console.error('Profile refresh error:', error);
        }
      };
      
      // Immediate profile refresh for admin detection
      refreshProfile();
    }
  }, [pathname, user]);

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
