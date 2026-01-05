// components/auth/RequireGuest.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

const ScreenLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

const RequireGuest = () => {
  const { isAuthenticated, isLoading } = useAuth();
  console.log("AUTHENTICATED IN GUEST", isAuthenticated);
  if (isLoading) {
    return <ScreenLoader />;
  }

  // If authenticated, redirect to home/
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default RequireGuest;
