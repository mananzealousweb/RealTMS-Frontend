// components/auth/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

const ScreenLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

const RequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <ScreenLoader />;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
