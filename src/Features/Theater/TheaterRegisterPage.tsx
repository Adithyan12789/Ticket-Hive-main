import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLoginTheaterMutation, useRegisterTheaterMutation } from "../../Store/TheaterApiSlice";
import {
  useVerifyOtpTheaterMutation,
  useResendOtpTheaterMutation,
} from "../../Store/TheaterApiSlice";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import Loader from "../User/Loader";
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from '@react-oauth/google';
import { setTheaterDetails } from "../../Store/TheaterAuthSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Store";
import { GoogleJwtPayload } from "../../Core/TheaterTypes";

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

  const [registerTheater, { isLoading }] = useRegisterTheaterMutation();
  const [verifyOtpTheater] = useVerifyOtpTheaterMutation();
  const [resendOtpTheater] = useResendOtpTheaterMutation();

  const [googleLoginTheater] = useGoogleLoginTheaterMutation();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;
  const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone);
  const validateName = (name: string) => name.trim().length >= 3;

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name) {
      toast.error("Name is required");
      return;
    }
    if (!email) {
      toast.error("Email is required");
      return;
    }
    if (!password) {
      toast.error("Password is required");
      return;
    }
    if (!confirmPassword) {
      toast.error("Confirm Password is required");
      return;
    }
    if (!phone) {
      toast.error("Phone number is required");
      return;
    }

    if (!validateName(name)) {
      toast.error("Name must be at least 3 characters");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Invalid email format");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!validatePhone(phone)) {
      toast.error("Invalid phone number (must be 10 digits)");
      return;
    }

    try {
      const response = await registerTheater({
        name,
        email,
        password,
        phone,
      }).unwrap();

      console.log(response);
      toast.success("Registration successful, please verify your OTP");

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      setOtpExpires(expiresAt);
      setTimeLeft(Math.floor((expiresAt.getTime() - Date.now()) / 1000));

      setShowOtpModal(true);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "data" in err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || "An error occurred");
      } else {
        toast.error("An error occurred");
      }
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

      toast.success("Google login successful!");
      navigate("/theater");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred during Google login"
      );
    }
  };

  useEffect(() => {
    if (otpExpires) {
      const interval = setInterval(() => {
        const timeRemaining = Math.floor(
          (otpExpires.getTime() - Date.now()) / 1000
        );
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
    if (!otp) {
      toast.error("OTP is required");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOtpTheater({ email, otp }).unwrap();
      toast.success("OTP verification successful");
      setShowOtpModal(false);
      navigate("/theater-login");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "data" in err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || "An error occurred");
      } else {
        toast.error("An error occurred");
      }
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
      await resendOtpTheater({ email }).unwrap();
      toast.success("OTP resent successfully");

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      setOtpExpires(expiresAt);
      setTimeLeft(Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "data" in err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || "An error occurred");
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setIsResending(false);
    }
  };


  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (isLoading || isVerifying || isResending) return <Loader />

  return (
    <div className="min-h-screen flex justify-center items-center bg-cover bg-center relative overflow-hidden font-sans"
      style={{ backgroundImage: "url('pngtree-old-movie-posters-on-the-wall-image_2881318.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 w-full max-w-xl p-8 bg-black/80 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md max-h-[90vh] overflow-y-auto theater-signup-container-scroll">
        <h1 className="text-center text-3xl font-bold text-red-500 mb-6 tracking-wide">
          Ticket Hive - Theater Owner
        </h1>
        <form onSubmit={submitHandler} className="space-y-5">
          <div className="space-y-2">
            <div className="relative flex items-center group">
              <span className="absolute left-4 text-gray-500 group-focus-within:text-red-500 transition-colors z-10">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:bg-white/10 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative flex items-center group">
              <span className="absolute left-4 text-gray-500 group-focus-within:text-red-500 transition-colors z-10">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:bg-white/10 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative flex items-center group">
              <span className="absolute left-4 text-gray-500 group-focus-within:text-red-500 transition-colors z-10">
                <FontAwesomeIcon icon={faPhone} />
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:bg-white/10 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative flex items-center group">
              <span className="absolute left-4 text-gray-500 group-focus-within:text-red-500 transition-colors z-10">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:bg-white/10 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative flex items-center group">
              <span className="absolute left-4 text-gray-500 group-focus-within:text-red-500 transition-colors z-10">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:bg-white/10 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-700/30 active:scale-[0.98]"
            type="submit"
            disabled={isLoading}
          >
            Sign Up
          </button>

          <div className="text-center pt-2 text-gray-400 text-sm">
            <p>
              Already have an account? <a href="/theater-login" className="text-red-400 hover:text-red-300 font-semibold hover:underline">Login Now</a>
            </p>
          </div>
        </form>

        <div className="text-center my-4 flex justify-center">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "677515594917-egtbr0hasoe3pf9j7npt2sk1s3v0e5e2.apps.googleusercontent.com"}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed.")}
              theme="filled_black"
              shape="pill"
            />
          </GoogleOAuthProvider>
        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-surface border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">OTP Verification</h3>
            <p className="text-gray-400 mb-6 text-sm">
              We have sent an OTP to your email. Please enter the OTP below to
              proceed with the verification.
            </p>
            <div className="mb-6 flex justify-center">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                className="w-2/3 px-4 py-3 bg-white/5 border border-gray-600 rounded-xl text-center text-white text-xl tracking-widest focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleOtpSubmit}
                disabled={isVerifying || timeLeft < 0}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${isVerifying || timeLeft < 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30'}`}
              >
                Verify OTP
              </button>

              {timeLeft <= 0 && (
                <button
                  onClick={handleOtpResend}
                  disabled={isResending}
                  className="w-full py-3 rounded-xl font-semibold text-green-500 border border-green-500 hover:bg-green-500/10 transition-all"
                >
                  Resend OTP
                </button>
              )}

              <p className="text-sm text-red-500 mt-2 font-mono">
                Time Left: <span className="font-bold">{formatTimeLeft()}</span>
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Didn’t receive the OTP? wait until the time expires to resend.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
