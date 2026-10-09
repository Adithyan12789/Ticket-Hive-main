import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../Store";

const AdminPrivateRoute = () => {

  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  console.log("adminInfo: ", adminInfo);
  
  return adminInfo ? <Outlet /> : <Navigate to='/admin-login' />;
};

export default AdminPrivateRoute;
