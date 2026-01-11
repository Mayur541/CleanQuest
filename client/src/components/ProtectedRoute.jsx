import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const isAuth = localStorage.getItem("isAuthenticated") === "true";
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // 1. If not logged in at all, go to login
  if (!isAuth) {
    return <Navigate to="/login/user" replace />;
  }

  // 2. If Route requires Admin, but user is NOT admin, kick them out
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/profile" replace />; // Redirect to their profile instead
  }

  // 3. Otherwise, let them pass
  return children;
};

export default ProtectedRoute;