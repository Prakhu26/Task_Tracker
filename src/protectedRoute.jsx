import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  
  // Check if user exists in Redux state (which loads from localStorage)
  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;