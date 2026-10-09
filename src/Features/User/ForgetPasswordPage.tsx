import { useEffect, useState } from 'react';
import { useSendPasswordResetEmailMutation } from '../../Store/UserApiSlice';
import { toast } from 'react-toastify';
import Loader from "./Loader";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [sendPasswordResetEmail, { isLoading }] = useSendPasswordResetEmailMutation();

  useEffect(() => {
    document.title = "Forgot Password - Ticket Hive";
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (email.trim() === '') {
      toast.error('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      toast.error('Invalid email format');
      return;
    }
    try {
      await sendPasswordResetEmail({ email }).unwrap();
      toast.success('Password reset email sent successfully');
      setEmailSent(true);
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
          <h1 className="text-3xl font-display font-bold text-white tracking-tight mb-2">
            {emailSent ? 'Check Your Email' : 'Forgot Password'}
          </h1>
          <p className="text-gray-400 text-center text-sm">
            {emailSent
              ? 'We have sent password reset instructions to your email.'
              : 'Enter your email address and we will send you a link to reset your password.'}
          </p>
        </div>

        {emailSent ? (
          <div className="text-center space-y-6">
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
              <p className="text-gray-300">
                Email sent to: <span className="text-white font-semibold block mt-1">{email}</span>
              </p>
            </div>

            <div className="pt-4 space-y-4">
              <p className="text-gray-400 text-sm">
                Didn't receive the email?{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary-400 hover:text-primary-300 font-semibold hover:underline"
                >
                  Resend
                </button>
              </p>

              <Link to="/login" className="flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-dark-bg/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold rounded-lg shadow-lg transform transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="flex items-center justify-center text-sm text-gray-400 hover:text-white transition-colors">
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordScreen;
