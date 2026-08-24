import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { getCurrentUser } from '@/components/CurrentUser';

// Combines the `user_data` cookie (token + basic fields from the JWT login
// response) with the full WordPress user record (id, description, etc.)
// fetched from /users/me. `user` is null until that fetch resolves.
export const useCurrentUser = () => {
  const userData = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let isCurrent = true;
    setLoading(true);
    getCurrentUser(userData.token).then((fetchedUser) => {
      if (isCurrent) {
        setUser(fetchedUser);
        setLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [userData?.token]);

  return { userData, user, loading, authed: Boolean(userData) };
};

export default useCurrentUser;
