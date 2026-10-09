import { Route } from 'react-router-dom';
import TheaterHomePage from '../Features/Theater/TheaterDashboardPage';
import TheaterLoginPage from '../Features/Theater/TheaterLoginPage';
import TheaterRegisterPage from '../Features/Theater/TheaterRegisterPage';
import TheaterForgotPasswordPage from '../Features/Theater/TheaterForgetPassword';
import TheaterResetPassword from '../Features/Theater/TheaterResetPassword';
import TheaterProfilePage from '../Features/Theater/TheaterProfilePage';
import TheaterManagement from '../Features/Theater/TheaterManagement';
import TheaterPrivateRoute from '../Features/Theater/TheaterPrivateRoute';
import TheaterDetailPage from '../Features/Theater/TheaterDetailPage';
import AddScreenPage from '../Features/Theater/AddScreenPage';
import EditScreenPage from '../Features/Theater/EditScreenPage';
import OffersManagementPage from '../Features/Theater/OffersManagementPage';
import TheaterChatScreen from '../Features/Theater/TheaterChatScreen';
import TheaterBookingScreen from '../Features/Theater/TheaterBookingPage';

export const TheaterRoutes = (
  <>
    <Route path="/theater" element={<TheaterHomePage />} />
    <Route path="/theater-login" element={<TheaterLoginPage />} />
    <Route path="/theater-signup" element={<TheaterRegisterPage />} />
    <Route path="/theater-verifyotp" element={<TheaterRegisterPage />} />
    <Route path="/theater-forgot-password" element={<TheaterForgotPasswordPage />} />
    <Route path="/theater-reset-password/:token" element={<TheaterResetPassword />} />

    <Route path="" element={<TheaterPrivateRoute />}>
      <Route path="/theater-profile" element={<TheaterProfilePage />} />
      <Route path="/theater/management" element={<TheaterManagement />} />
      <Route path="/theater/details/:id" element={<TheaterDetailPage />} />
      <Route path="/theater/edit/:id" element={<TheaterManagement />} />
      <Route path="/theater/add-screen/:theaterId" element={<AddScreenPage />} />
      <Route path="/theater/edit-screen/:screenId" element={<EditScreenPage />} />
      <Route path="/theater/bookings" element={<TheaterBookingScreen />} />
      <Route path="/theater/offer-management" element={<OffersManagementPage />} />
      <Route path="/theater/chat" element={<TheaterChatScreen />} />
    </Route>
  </>
);
