import { useEffect, useState } from 'react';
import { useSendPasswordResetEmailTheaterMutation } from '../../Store/TheaterApiSlice';
import { toast } from 'react-toastify';
import Loader from "../../Features/User/Loader";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [sendPasswordResetEmailTheater, { isLoading }] = useSendPasswordResetEmailTheaterMutation();

  useEffect(() => {
    document.title = "Theater Forgot Password - Ticket Hive";
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
      await sendPasswordResetEmailTheater({ email }).unwrap();
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
    <div className="min-h-screen flex justify-center items-center bg-cover bg-center relative overflow-hidden font-sans"
      style={{ backgroundImage: "url('/pngtree-old-movie-posters-on-the-wall-image_2881318.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>

      {isLoading && <Loader />}

      <div className="relative z-10 w-full max-w-lg p-10 bg-black/80 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
        <h1 className="text-center text-3xl font-bold text-red-500 mb-6 tracking-wide">
          {emailSent ? 'Check Your Email' : 'Theater - Forgot Password'}
        </h1>

        {emailSent ? (
          <div className="text-center">
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              We have sent a password reset link to <strong className="text-white">{email}</strong>. Please check your email and follow the instructions to reset your password.
            </p>
            <div className="mt-4">
              <p className="text-gray-400">Didn't receive the email? <button className="text-red-400 hover:text-red-300 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer transition-colors" onClick={() => setEmailSent(false)}>Resend</button></p>
            </div>
          </div>
        ) : (
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="space-y-2">
              <div className="relative flex items-center group">
                <span className="absolute left-4 text-gray-500 group-focus-within:text-red-500 transition-colors z-10">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:bg-white/10 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-700/30 active:scale-[0.98]"
              type="submit"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
