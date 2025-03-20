/*
import { useEffect } from 'react';
import { useUserStore } from '../store/user';

export const useAuthCheck = () => {
  const { setUser } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.data.user);
        } else {
          setUser(null); // Reset on non-200 response
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        setUser(null); // Reset user state on auth failure
      }
    };
    
    checkAuth();
  }, [setUser]);
};
*/
/*
import { useEffect } from 'react';
import { useUserStore } from '../store/user';

export const useAuthCheck = () => {
    const { currentUser, setUser } = useUserStore();

    useEffect(() => {
        const checkAuth = async () => {
            const result = await currentUser();
            if (!result.success) {
                setUser(null); // Reset user state on auth failure
            }
        };
        checkAuth();
    }, [currentUser, setUser]);
};
*/

import { useEffect } from 'react';
import { useUserStore } from '../store/user';

export const useAuthCheck = () => {
  const currentUser = useUserStore(state => state.currentUser);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await currentUser();
      } catch (error) {
        console.error("Auth initialization error:", error);
      }
    };
    initializeAuth();

    // Optional: Periodic check every 15 minutes
    const interval = setInterval(initializeAuth, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser]);
}