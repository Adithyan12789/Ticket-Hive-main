import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Store';
import { useGetUserProfileQuery, useRefreshTokenMutation } from '../../Store/UserApiSlice';
import { logout } from '../../Store/AuthSlice';

const PrivateRoute: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [refreshToken] = useRefreshTokenMutation();

  // Initialize tokenVerified to true if userInfo already exists in Redux/localStorage.
  // This avoids blocking every protected-route navigation with a null render while
  // a background token refresh is in-flight. If the user is not logged in at all,
  // we start as false and immediately flip to true (triggering the redirect).
  const [tokenVerified, setTokenVerified] = useState(() => !!userInfo);

  // Track whether the initial proactive refresh has been attempted for this session.
  // We only want to run the refresh once on the first mount, then on a 14-min interval.
  const hasRunInitialRefresh = useRef(false);

  const userId = userInfo?.id;

  console.log("Private Route - User Info:", userInfo);

  useEffect(() => {
    let cancelled = false;

    const verifyToken = async () => {
      if (userInfo) {
        console.log('private route: attempting proactive token refresh');
        try {
          await refreshToken().unwrap();
          console.log('private route: token refreshed successfully');
        } catch (error) {
          // Refresh token failed — this could mean:
          // 1. The refresh token cookie wasn't sent yet (timing issue right after login)
          // 2. The refresh token genuinely expired
          // We do NOT logout here — we let the profile query determine if the user
          // is truly unauthenticated (access token also invalid → 401 → then logout).
          console.log('private route: token refresh failed (will rely on access token)', error);
        } finally {
          if (!cancelled) {
            setTokenVerified(true);
          }
        }
      } else {
        // No userInfo at all — mark as settled so we redirect to login immediately
        if (!cancelled) setTokenVerified(true);
      }
    };

    // Only run the initial refresh once. Skip it on re-renders caused by navigation
    // between protected routes (since userInfo hasn't changed in those cases).
    if (!hasRunInitialRefresh.current) {
      hasRunInitialRefresh.current = true;
      verifyToken();
    }

    // Schedule the recurring proactive renewal every 14 minutes
    const intervalId = setInterval(verifyToken, 14 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only run the profile query after the token refresh attempt settles,
  // so we never hit a 401 from a stale access token that was about to be refreshed.
  const { error } = useGetUserProfileQuery(userId, {
    skip: !userId || !tokenVerified,
  });

  useEffect(() => {
    if (error) {
      console.log("Error fetching user profile:", error);
      if ('status' in error && error.status === 401) {
        // The access token is truly invalid (expired or tampered).
        // Only now do we log the user out and redirect to login.
        console.log("Unauthorized (profile 401) — logging out.");
        dispatch(logout());
      }
    }
  }, [error, dispatch]);

  // While the initial token check is in-flight, render nothing to avoid a flash redirect.
  if (!tokenVerified) {
    return null;
  }

  // Redirect to login if no userInfo in Redux state
  return userInfo ? <Outlet /> : <Navigate to='/login' replace />;
};

export default PrivateRoute;
