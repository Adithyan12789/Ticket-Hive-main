import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLoginMutation, useRegisterMutation, useVerifyOtpMutation, useResendOtpMutation } from "../../Store/UserApiSlice";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faPhone, faClock } from "@fortawesome/free-solid-svg-icons";
import Loader from "./Loader";
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { setCredentials } from "../../Store/AuthSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Store";
import { GoogleJwtPayload } from "../../Core/UserTypes";
import { motion, AnimatePresence } from "framer-motion";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpExpires, setOtpExpires] = useState<Date | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [register, { isLoading }] = useRegisterMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [resendOtp] = useResendOtpMutation();
  const [googleLogin] = useGoogleLoginMutation();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) =>
    password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone);
  const validateName = (name: string) => name.trim().length >= 3;

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = [];
    if (!name) errors.push("Name is required.");
    if (!email) errors.push("Email is required.");
    if (!password) errors.push("Password is required.");
    if (!confirmPassword) errors.push("Please confirm your password.");
    if (!phone) errors.push("Phone number is required.");
    if (!validateName(name)) errors.push("Please enter a valid name.");
    if (!validateEmail(email)) errors.push("Please enter a valid email address.");
    if (!validatePassword(password)) errors.push("Password must be at least 8 characters long, with letter, number, and special character.");
    if (password !== confirmPassword) errors.push("Passwords do not match.");
    if (!validatePhone(phone)) errors.push("Please enter a valid phone number.");

    if (errors.length > 0) {
      toast.error(errors.join(' '));
      return;
    }

    try {
      await register({ name, email, password, phone }).unwrap();
      toast.success("Registration successful, please verify your OTP");
      const expiresAt = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000);
      setOtpExpires(expiresAt);
      setTimeLeft(Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setShowOtpModal(true);
    } catch (err: unknown) {
      const errorMessage = (err as any)?.data?.message || (err as any)?.message || "An error occurred";
      toast.error(errorMessage);
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
      const responseFromApiCall = await googleLogin({ googleName, googleEmail }).unwrap();
      dispatch(setCredentials({ ...responseFromApiCall }));
      toast.success("Google login successful!");
      navigate("/");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred during Google login");
    }
  };

  useEffect(() => {
    if (otpExpires) {
      const interval = setInterval(() => {
        const timeRemaining = Math.floor((otpExpires.getTime() - Date.now()) / 1000);
        setTimeLeft(timeRemaining);
        if (timeRemaining <= 0) {
          clearInterval(interval);
          setOtpExpires(null);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpExpires]);

  const handleOtpSubmit = async () => {
    if (!otp || !/^\d{6}$/.test(otp)) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }
    setIsVerifying(true);
    try {
      await verifyOtp({ email, otp }).unwrap();
      toast.success("OTP verification successful");
      setShowOtpModal(false);
      navigate("/login");
    } catch (err: unknown) {
      const errorMessage = (err as any)?.data?.message || (err as any)?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpResend = async () => {
    if (timeLeft > 0) {
      toast.error("You can only resend OTP after the previous one expires.");
      return;
    }
    setIsResending(true);
    try {
      await resendOtp({ email }).unwrap();
      toast.success("OTP resent successfully");
      const expiresAt = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000);
      setOtpExpires(expiresAt);
      setTimeLeft(Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    } catch (err: unknown) {
      const errorMessage = (err as any)?.data?.message || (err as any)?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isLoading || isVerifying || isResending) return <Loader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/pngtree-old-movie-posters-on-the-wall-image_2881318.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md px-6 py-8 md:px-8 md:py-10 bg-dark-surface/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 my-10"
      >
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center space-x-3 mb-4 group">
            <img src="/logo.png" alt="Ticket Hive" className="w-16 h-16 object-contain group-hover:scale-110 transition-transform" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-gray-400 mt-2">Join us and start booking movies</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faUser} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-dark-bg/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500 transition-all outline-none"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-dark-bg/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500 transition-all outline-none"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
            </div>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-dark-bg/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500 transition-all outline-none"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faLock} className="text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-dark-bg/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500 transition-all outline-none"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faLock} className="text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-dark-bg/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500 transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold rounded-lg shadow-lg transform transition-all hover:-translate-y-0.5 mt-2 disabled:opacity-50"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-surface text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <GoogleOAuthProvider clientId="677515594917-egtbr0hasoe3pf9j7npt2sk1s3v0e5e2.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google login failed.")}
                theme="filled_black"
                shape="circle"
              />
            </GoogleOAuthProvider>
          </div>
        </div>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold hover:underline">
            Login Now
          </Link>
        </p>
      </motion.div>

      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">OTP Verification</h3>
              <p className="text-gray-600 mb-6 text-sm">
                We have sent an OTP to your email. Please enter it below to verify your account.
              </p>

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full text-center text-2xl tracking-widest py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 outline-none mb-6 font-mono text-gray-800"
              />

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleOtpSubmit}
                  disabled={isVerifying || timeLeft < 0}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </button>

                {timeLeft <= 0 ? (
                  <button
                    onClick={handleOtpResend}
                    disabled={isResending}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <div className="flex items-center justify-center text-primary-600 font-medium">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    {formatTimeLeft()}
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Didn't receive code? Check your spam folder or wait to resend.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignUpPage;

