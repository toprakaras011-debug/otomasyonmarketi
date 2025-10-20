'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';

type AuthHydrationContextValue = {
  initialUser: User | null;
  initialProfile: any;
};

const AuthHydrationContext = createContext<AuthHydrationContextValue>({
  initialUser: null,
  initialProfile: null,
});

export function AuthProvider({
  initialUser,
  initialProfile,
  children,
}: {
  initialUser: User | null;
  initialProfile: any;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ initialUser, initialProfile }),
    [initialUser, initialProfile]
  );

  return (
    <AuthHydrationContext.Provider value={value}>
      {children}
    </AuthHydrationContext.Provider>
  );
}

export function useAuthHydration() {
  return useContext(AuthHydrationContext);
}
