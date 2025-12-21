// client/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Check if our "secret flag" exists in the browser
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  if (!isAuthenticated) {
    // If not logged in, kick them back to Login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, let them see the page (the "children")
  return children;
}

export default ProtectedRoute;