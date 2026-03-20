import { Navigate, useLocation } from "react-router-dom";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: ("student" | "company")[];
};

/**
 * Redirects to /login if not authenticated.
 * If allowedRoles is set, also redirects if user role is not in the list.
 */
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") as "student" | "company" | null;

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && role && !allowedRoles.includes(role)) {
    // Wrong role: send to their dashboard or home
    if (role === "student") return <Navigate to="/student/dashboard" replace />;
    if (role === "company") return <Navigate to="/company/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
