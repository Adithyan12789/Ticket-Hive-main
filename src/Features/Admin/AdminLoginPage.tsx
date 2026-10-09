import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAdminLoginMutation } from '../../Store/AdminApiSlice';
import { setCredentials } from '../../Store/AdminAuthSlice';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { RootState, AppDispatch } from '../../Store';
import { AdminResponse } from '../../Core/AdminTypes';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [login, { isLoading }] = useAdminLoginMutation();

  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (adminInfo) {
      navigate('/admin/dashboard');
    }
  }, [navigate, adminInfo]);


  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const submitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error('Invalid email format');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {

      const res: AdminResponse = await login({ email, password }).unwrap();

      if (res && res.isAdmin) {
        console.log("Admin verified, dispatching setCredentials", res);
        dispatch(setCredentials({
          ...res,
        }));
        navigate('/admin/dashboard');
      } else {
        console.warn("User is not an admin", res);
        toast.error('You do not have admin access');
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null) {
        const errorObj = err as { status?: number | string; data?: { message?: string }; error?: string; message?: string };
        console.error("Admin Login Error Details:", {
          status: errorObj.status,
          data: errorObj.data,
          error: errorObj.error,
          message: errorObj.message
        });

        if (errorObj.data?.message) {
          toast.error(errorObj.data.message);
        } else if (errorObj.status === 400) {
          toast.error('Bad Request: Please check your credentials or server configuration');
        } else if (errorObj.status === 'FETCH_ERROR') {
          toast.error('Cannot connect to server. Please check if backend is running.');
        } else {
          toast.error('An unexpected error occurred during login');
        }
      } else {
        toast.error('An unexpected error occurred during login');
      }
    }
  };


  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden font-sans">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 bg-[url('/pngtree-old-movie-posters-on-the-wall-image_2881318.jpg')]"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-black/80 to-blue-900/60 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10 relative overflow-hidden group">

          {/* Decorative Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl group-hover:bg-blue-500/50 transition-colors duration-500"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl group-hover:bg-purple-500/50 transition-colors duration-500"></div>

          <div className="relative z-10 flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 ring-2 ring-white/20 transform rotate-3 group-hover:rotate-6 transition-transform duration-300">
              <span className="text-2xl font-bold font-mono text-white">TH</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-gray-400 mt-2 text-sm">Sign in to manage Ticket Hive</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-5 relative z-10">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Email</label>
              <div className="relative flex items-center group/input">
                <FaEnvelope className="absolute left-4 text-gray-500 group-focus-within/input:text-blue-400 transition-colors z-10" />
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Password</label>
              <div className="relative flex items-center group/input">
                <FaLock className="absolute left-4 text-gray-500 group-focus-within/input:text-blue-400 transition-colors z-10" />
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] mt-4"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Accessing...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-xs mt-8">
          &copy; {new Date().getFullYear()} Ticket Hive. Secure Admin Access.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
