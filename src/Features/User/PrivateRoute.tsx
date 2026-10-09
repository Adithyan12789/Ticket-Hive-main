import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Store';
import { useGetUserProfileQuery, useRefreshTokenMutation } from '../../Store/UserApiSlice';
import { logout } from '../../Store/AuthSlice';

const PrivateRoute: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [refreshToken] = useRefreshTokenMutation();

  const userId = userInfo?.id;

  console.log("Private Route - User Info:", userInfo);
  
  useEffect(() => {
    const verifyToken = async () => {
      if (userInfo) {
        console.log('private route checked the refresh Token')
        try {
          await refreshToken().unwrap();
        } catch (error) {
          console.log(error)
          dispatch(logout());
        }
      }
    };

    verifyToken();
    const intervalId = setInterval(verifyToken, 14 * 60 * 1000); 

    return () => clearInterval(intervalId);
  }, [refreshToken, dispatch, userInfo]);

  const { error } = useGetUserProfileQuery(userId, {
    skip: !userId,
  });

  useEffect(() => {
    if (error) {
      console.log("Error fetching user profile:", error);
      if ('status' in error && error.status === 401) {
        console.log("Unauthorized - Logging out.");
        dispatch(logout());
      }
    }
  }, [error, dispatch]);

  // Redirect to login if no userInfo is available
  return userInfo ? <Outlet /> : <Navigate to='/login' replace />;
};

export default PrivateRoute;

