import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleLoginTheaterMutation, useLoginTheaterMutation } from '../../Store/TheaterApiSlice';
import { setTheaterDetails } from '../../Store/TheaterAuthSlice';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { RootState, AppDispatch } from '../../Store';
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from '@react-oauth/google';
import { GoogleJwtPayload } from '../../Core/TheaterTypes';

const TheaterLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [login, { isLoading }] = useLoginTheaterMutation();
  const [googleLoginTheater] = useGoogleLoginTheaterMutation();

  const { theaterInfo } = useSelector((state: RootState) => state.theaterAuth);

  useEffect(() => {
    if (theaterInfo) {
      navigate('/theater');
    }
  }, [navigate, theaterInfo]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
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

    if (password.trim() === '') {
      toast.error('Password is required');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setTheaterDetails({
        ...res,
        location: '',
        capacity: 0,
        data: undefined
      }));
      navigate('/theater');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'An error occurred');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google login failed. No credential received.");
      return;
    }

    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
      if (!decoded.email || !decoded.name) {
        throw new Error("Invalid token payload");
      }

      const { name: googleName, email: googleEmail } = decoded;

      const responseFromApiCall = await googleLoginTheater({ googleName, googleEmail }).unwrap();
      dispatch(setTheaterDetails({ ...responseFromApiCall }));
      navigate("/theater");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred during Google login"
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-cover bg-center relative overflow-hidden font-sans"
      style={{ backgroundImage: "url('/pngtree-old-movie-posters-on-the-wall-image_2881318.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 w-full max-w-lg p-10 bg-black/80 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
        <h1 className="text-center text-3xl font-bold text-red-500 mb-8 tracking-wide">
          Ticket Hive - Theater Owner
        </h1>
        <form onSubmit={submitHandler} className="space-y-6">
          <div className="space-y-2">
            <div className="relative flex items-center group">
              <FaEnvelope className="absolute left-4 text-gray-500 group-focus-within:text-red-500 transition-colors z-10" />
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:bg-white/10 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative flex items-center group">
              <FaLock className="absolute left-4 text-gray-500 group-focus-within:text-red-500 transition-colors z-10" />
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:bg-white/10 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <a href="/theater-forgot-password"
              className="text-sm text-gray-400 hover:text-red-400 hover:underline transition-colors">
              Forgot Password?
            </a>
          </div>

          <button
            className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-700/30 active:scale-[0.98]"
            type="submit"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : 'Sign In'}
          </button>

          <div className="text-center pt-4 text-gray-400 text-sm">
            <p>Already a User? <a href="/theater-signup" className="text-red-400 hover:text-red-300 font-semibold hover:underline bg-transparent p-0">Sign Up</a></p>
          </div>
        </form>

        <div className="text-center my-6 flex justify-center">
          <GoogleOAuthProvider clientId="677515594917-egtbr0hasoe3pf9j7npt2sk1s3v0e5e2.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed.")}
              theme="filled_black"
              shape="pill"
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
};

export default TheaterLoginPage;
