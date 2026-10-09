import { Route, Navigate } from 'react-router-dom';
import AdminLoginPage from '../Features/Admin/AdminLoginPage';
import AdminDashboard from '../Features/Admin/AdminDashboard';
import AdminPrivateRoute from '../Features/Admin/AdminPrivateRoute';
import AdminUser from '../Features/Admin/AdminUserManagement';
import TheaterOwners from '../Features/Admin/TheaterOwnerManagement';
import VerificationRequests from '../Features/Admin/VerificationRequests';
import MovieManagement from '../Features/Admin/MoviesManagement';
import MovieDetailsPage from '../Features/Admin/MovieDetailsPage';
import AdminBookingsPage from '../Features/Admin/AdminBookingsPage';
import BookingDetailsPage from '../Features/Admin/BookingDetailsPage';
import AdminChatScreen from '../Features/Admin/AdminChatScreen';
import CastManagement from '../Features/Admin/CastManagement';

export const AdminRoutes = (
  <Route path="/admin" element={<AdminPrivateRoute />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path='dashboard' element={<AdminDashboard />} />
    <Route path="verification" element={<VerificationRequests />} />
    <Route path="get-user" element={<AdminUser />} />
    <Route path="get-theaterOwner" element={<TheaterOwners />} />
    <Route path="add-movies" element={<MovieManagement />} />
    <Route path="get-movies" element={<MovieManagement />} />
    <Route path="movie-details/:id" element={<MovieDetailsPage />} />
    <Route path="bookings" element={<AdminBookingsPage />} />
    <Route path="bookings/:bookingId" element={<BookingDetailsPage />} />
    <Route path="chat" element={<AdminChatScreen />} />
    <Route path="cast" element={<CastManagement />} />
  </Route>
);

export const AdminLoginRoute = <Route path="/admin-login" element={<AdminLoginPage />} />;
