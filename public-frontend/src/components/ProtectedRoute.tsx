import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../redux/authStore";

interface ProtectedRouteProps {
  allowedRoles?: ("customer" | "vendor" | "admin")[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { accessToken, user } = useAuthStore();
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};