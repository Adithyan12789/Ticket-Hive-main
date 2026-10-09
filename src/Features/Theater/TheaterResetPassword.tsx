import { useEffect, useState } from 'react';
import { useResetPasswordTheaterMutation } from '../../Store/TheaterApiSlice';
import { toast } from 'react-toastify';
import Loader from "../../Features/User/Loader";
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';

const TheaterOwnerResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordTheaterMutation();

  useEffect(() => {
    document.title = "Reset Password - Ticket Hive";
  }, []);

  const submitHandler = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }


    if (password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error('Password must contain at least one letter, one number, one special character and must be at least 8 characters.');
      return;
    }

    try {
      await resetPassword({ token, password }).unwrap();
      toast.success('Password reset successfully');
      navigate('/theater-login');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'data' in err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || 'An error occurred');
      } else {
        toast.error('An error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-cover bg-center relative overflow-hidden font-sans"
      style={{ backgroundImage: "url('/pngtree-old-movie-posters-on-the-wall-image_2881318.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>

      {isLoading && <Loader />}

      <div className="relative z-10 w-full max-w-lg p-10 bg-black/80 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
        <h1 className="text-center text-3xl font-bold text-red-500 mb-6 tracking-wide">
          Reset Your Password
        </h1>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="space-y-2">
            <div className="relative flex items-center group">
              <span className="absolute left-4 text-gray-500 group-focus-within:text-red-500 transition-colors z-10">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:bg-white/10 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative flex items-center group">
              <span className="absolute left-4 text-gray-500 group-focus-within:text-red-500 transition-colors z-10">
                <FontAwesomeIcon icon={faUnlockAlt} />
              </span>
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:bg-white/10 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-700/30 active:scale-[0.98]"
            type="submit"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default TheaterOwnerResetPasswordScreen;
