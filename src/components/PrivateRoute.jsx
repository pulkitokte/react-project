// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "./Loading";

export default function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
