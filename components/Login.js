import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import DOMPurify from 'dompurify';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_FOR_JWT_TOKEN}`, {
        username,
        password,
      });
	  // console.log( response );
    //   const { token, user_display_name, user_email, user_nicename } = response.data;

      // Store the token in cookies or localStorage
      document.cookie = `user_data=${encodeURIComponent(JSON.stringify(response.data))}; path=/`;

    //   console.log('User logged in:', user_display_name, user_email, user_nicename);
      router.push('/'); // Redirect to home or another page
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='border-2 border-black rounded-sm px-3 py-2'
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className='border-2 border-black rounded-sm px-3 py-2'
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className='mt-5 px-5 py-2 border-2 border-black rounded-sm bg-black text-white hover:bg-slate-700 hover:border-black transition-all'>Login</button>
        {error && <div className="error text-red-800" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(error)}} />}
        
      </form>
    </div>
  );
};

export default Login;