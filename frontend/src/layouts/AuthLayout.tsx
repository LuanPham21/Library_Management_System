import { Outlet, Navigate } from "react-router-dom";
import { authStorage } from "../lib/config/auth.config";

const AuthLayout: React.FC = () => {
  if (authStorage.isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthLayout;
