'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { verifyToken } from '@/lib/service/auth.service';
import { useUserStore } from '@/lib/stores/auth.store';
import { useGrindStore } from '@/lib/stores/grind.store';

import { Grind } from '@/types/grind.types';
import { User } from '@/types/user.types';
import GrindHomePageView from './components/GrindHomePageView';
import LandingPageView from './components/LandingPageView';

export default function AuthenticatedPageWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const setUser = useUserStore((state: any) => state.setUser);
  const setGrind = useGrindStore((state: any) => state.setCurrentGrind);
  const user: User | null = useUserStore((state: any) => state.user);  
  const currentGrind: Grind | null = useGrindStore((state: any) => state.currentGrind);
  
  useEffect(() => {
    const performAuthCheck = async () => {
      try {
        const { user, currentGrind } = await verifyToken();
        setUser(user);
        setGrind(currentGrind);

        console.log("Authentication check successful:", user, currentGrind);
        setIsAuthenticated(true);

      } catch (error) {
        console.log("Authentication check failed:", error);
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