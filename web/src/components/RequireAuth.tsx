import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/auth/useAuth";
import Spinner from "@/components/ui/Spinner";

export default function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    console.log(location);
    const from = `${location.pathname}${location.search}${location.hash}`;

    return <Navigate to="/login" replace state={{ from }} />;
  }

  return <Outlet />;
}
