import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Features/User/Header';
import Footer from './Features/User/Footer';
import TheaterHeader from "./Features/Theater/TheaterHeader";
import AdminHeader from "./Features/Admin/AdminHeader";


const App: React.FC = () => {
  const location = useLocation();

  const isSignInPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/sign-up";
  const isAdminSignInPage = location.pathname === "/admin-login";
  const isForgotPasswordPage = location.pathname === "/forgot-password";
  const isResetPasswordPage = /^\/reset-password\/.+$/.test(location.pathname);

  const isTheaterSignInPage = location.pathname === "/theater-login";
  const isTheaterSignUpPage = location.pathname === "/theater-signup";
  const isTheaterForgotPasswordPage = location.pathname === "/theater-forgot-password";
  const isTheaterResetPasswordPage = /^\/theater-reset-password\/.+$/.test(location.pathname);

  const isOtpPage = location.pathname === "/verifyotp" || location.pathname === "/theater-verify-otp";

  const isAdminPage = location.pathname.startsWith("/admin");
  const isTheaterPage = location.pathname.startsWith("/theater");

  const isAuthPage = isSignInPage || isSignUpPage || isOtpPage || isForgotPasswordPage
    || isResetPasswordPage || isAdminSignInPage || isTheaterSignInPage
    || isTheaterSignUpPage || isTheaterForgotPasswordPage || isTheaterResetPasswordPage;

  if (isAuthPage) {
    return (
      <>
        <ToastContainer />
        <Outlet />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-gray-100 font-sans">
      {isAdminPage ? (
        <AdminHeader />
      ) : isTheaterPage ? (
        <TheaterHeader />
      ) : (
        <Header />
      )}

      <ToastContainer />

      <main className={`flex-grow ${location.pathname === '/' || location.pathname.startsWith('/movie-detail') || location.pathname.startsWith('/movie-theaters') || location.pathname.startsWith('/seat-select') || location.pathname === '/booking' || location.pathname === '/profile' || isAdminPage ? '' : 'pt-24'}`}>
        <Outlet />
      </main>

      {!isAdminPage && !isTheaterPage && <Footer />}
    </div>
  );
};

export default App;
