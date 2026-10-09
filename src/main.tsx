import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import './main.css';
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import { Provider } from 'react-redux';
import store from './Store';

import { AdminRoutes, AdminLoginRoute } from './Routes/AdminRoutes';
import { UserRoutes } from './Routes/UserRoutes';
import { TheaterRoutes } from './Routes/TheaterRoutes';
import ErrorBoundaryWrapper from './Features/User/ErrorBountary';
import ErrorPage from './Components/Common/ErrorPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<ErrorPage />}>
      {/* Admin Routes */}
      {AdminRoutes}
      {AdminLoginRoute}

      {/* User Routes */}
      {UserRoutes}

      {/* Theater Owner Routes */}
      {TheaterRoutes}
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <React.StrictMode>
      <ErrorBoundaryWrapper>
        <RouterProvider router={router} />
      </ErrorBoundaryWrapper>
    </React.StrictMode>
  </Provider>
);
