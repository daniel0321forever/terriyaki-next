'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { verifyToken } from '@/lib/service/auth.service';
import { useUserStore } from '@/lib/stores/auth.store';
import { useGrindStore } from '@/lib/stores/grind.store';

import GrindHomePageView from './components/GrindHomePageView';
import LandingPageView from './components/LandingPageView';
import { User } from '@/types/user.types';
import { UserStoreState } from '@/lib/stores/auth.store';

export default function AuthenticatedPageWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const setUser = useUserStore((state: UserStoreState) => state.setUser);
  const setGrinds = useGrindStore((state) => state.setGrinds);
  const user: User | null = useUserStore((state: UserStoreState) => state.user);  
  
  useEffect(() => {
    const performAuthCheck = async () => {
      try {
        const { user, grinds } = await verifyToken();
        setUser(user);
        setGrinds(grinds);

        console.log("Authentication check successful");
        setIsAuthenticated(true);

      } catch (error) {
        console.warn("Authentication check failed:", error);
        setIsAuthenticated(false);
      }
    };

    if (user === null) {
      performAuthCheck();
    } else {  
      setIsAuthenticated(true);
    }
  }, []);

  // Loading state - return blank page
  if (isAuthenticated === null) {
    return <div></div>;
  }

  // Return HomePage if authenticated, LoginForm if not
  console.log("isAuthenticated:", isAuthenticated);
  return isAuthenticated ? <GrindHomePageView /> : <LandingPageView />;
}