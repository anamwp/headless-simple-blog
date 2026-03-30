import { useState, useEffect } from 'react';
import { getCurrentUser } from '../components/CurrentUser';

export default function useAutoLogin() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find((cookie) => cookie.startsWith('user_data='));

    if (userCookie) {
      const parsedData = JSON.parse(
        decodeURIComponent(userCookie.split('=')[1])
      );
      setUserData(parsedData);
      const token = parsedData.token;
      if (token) {
        getCurrentUser(token).then((u) => {
          if (u) {
            setUser(u);
          } else {
            console.log('User is not logged in');
          }
        });
      }
    }
  }, []);

  return { user, userData };
}
