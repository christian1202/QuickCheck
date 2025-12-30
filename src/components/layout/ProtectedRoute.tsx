import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  // 1. Loading State
  // While Firebase is checking the user's status, show a simple loading indicator.
  // You can replace this with a fancy spinner component later.
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // 2. Unauthenticated State
  // If loading is done and there is no user, redirect to Login.
  // 'replace' prevents the user from hitting "Back" and returning to this protected page.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 3. Authenticated State
  // If the user is logged in, render the child routes (The Dashboard, etc.)
  return <Outlet />;
}