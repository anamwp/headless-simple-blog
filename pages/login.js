import Login from '../components/Login';
import useAutoLogin from '../hooks/useAutoLogin';

export default function LoginPage() {
  const { user, userData } = useAutoLogin();

  const logout = () => {
    document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.reload();
  };

  return (
    <div className='container max-w-screen-md mx-auto p-5'>
      {/* Show login if no user */}
      {!userData && (
        <div className='flex flex-col gap-3 p-10 bg-slate-100 rounded-md'>
          <p className='text-xl font-bold text-slate-700'>Login</p>
          <Login />
        </div>
      )}
      {/* Show user details */}
      {user && (
        <div className='flex flex-col gap-3'>
          <div className='p-5 bg-slate-100 rounded-md flex flex-col gap-1'>
            <p className='text-xl font-bold text-slate-700 mb-3'>Current User</p>
            <p><b>User:</b> {user.name}</p>
            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {userData.user_email}</p>
            <p><b>Description:</b> {user.description}</p>
            <p><b>URL:</b> {user.url}</p>
          </div>
          <button onClick={logout} className='mt-5 px-5 py-2 border-2 border-black rounded-sm bg-black text-white hover:bg-slate-700 hover:border-black transition-all'>Logout</button>
        </div>
      )}
    </div>
  );
}
