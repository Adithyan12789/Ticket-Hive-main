import { useEffect, useState } from 'react';
import { useResetPasswordMutation } from '../../Store/UserApiSlice';
import { toast } from 'react-toastify';
import Loader from "./Loader";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

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
      navigate('/login');
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
    <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
      {isLoading && <Loader />}
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/pngtree-old-movie-posters-on-the-wall-image_2881318.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6 py-8 md:px-8 md:py-10 bg-dark-surface/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10"
      >
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center space-x-3 mb-6 group">
            <img src="/logo.png" alt="Ticket Hive" className="w-16 h-16 object-contain group-hover:scale-110 transition-transform" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Enter your new password below</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faLock} className="text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 bg-dark-bg/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all outline-none"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faUnlockAlt} className="text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 bg-dark-bg/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold rounded-lg shadow-lg transform transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            Reset Password
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordScreen;
