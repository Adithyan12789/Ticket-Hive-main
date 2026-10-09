import { Route } from 'react-router-dom';
import HomePage from '../Features/User/HomePage';
import LoginPage from '../Features/User/LoginPage';
import RegisterPage from '../Features/User/RegisterPage';
import ForgotPassword from '../Features/User/ForgetPasswordPage';
import ResetPassword from '../Features/User/ResetPasswordPage';
import UserProfilePage from '../Features/User/UserProfilePage';
import PrivateRoute from '../Features/User/PrivateRoute';
import MovieDetailScreen from '../Features/User/MovieDetailPage';
import MovieTheaterScreen from '../Features/User/MovieTheaterPage';
import SelectSeatPage from '../Features/User/SeatSelectionPage';
import BookingPage from '../Features/User/BookingPage';
import ThankYou from '../Features/User/ThankyouPage';
import TicketsScreen from '../Features/User/TicketsPage';
import TicketDetailsScreen from '../Features/User/TicketDetailsPage';
import AllMoviesPage from '../Features/User/AllMoviesPage';
import WalletPage from '../Features/User/WalletPage';

export const UserRoutes = (
  <>
    <Route index element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/sign-up" element={<RegisterPage />} />
    <Route path="/verifyotp" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />

    <Route path="" element={<PrivateRoute />}>
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/movie-detail/:id" element={<MovieDetailScreen />} />
      <Route path="/movie-theaters/:movieTitle" element={<MovieTheaterScreen />} />
      <Route path="/seat-select/:screenId" element={<SelectSeatPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/thankyou" element={<ThankYou />} />
      <Route path="/tickets" element={<TicketsScreen />} />
      <Route path="/ticket/:bookingId" element={<TicketDetailsScreen />} />

      <Route path="/allMovies" element={<AllMoviesPage />} />
      <Route path="/wallet" element={<WalletPage />} />
    </Route>
  </>
);  
