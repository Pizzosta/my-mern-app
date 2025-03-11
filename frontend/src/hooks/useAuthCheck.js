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
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.log('Auth check failed:', error);
      }
    };
    
    checkAuth();
  }, [setUser]);
};