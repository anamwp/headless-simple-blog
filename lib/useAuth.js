import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const readUserDataCookie = () => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  const userCookie = cookies.find((cookie) => cookie.startsWith('user_data='));
  if (!userCookie) return null;
  try {
    return JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
  } catch (error) {
    console.error('Failed to parse user data from cookie:', error);
    return null;
  }
};

// Single source of truth for reading the logged-in user out of the `user_data` cookie.
export const useAuth = () => {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setUserData(readUserDataCookie());

    const handleRouteChange = () => setUserData(readUserDataCookie());
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  return userData;
};

export default useAuth;
