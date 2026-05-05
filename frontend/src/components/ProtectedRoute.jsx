import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Loader from "./Loader";

const ProtectedRoute = ({ children }) => {
  const { userData, loading } = useContext(AppContext);

  // ⏳ Show loader while checking auth
  if (loading) {
    return <Loader />;
  }

  // ❌ Not logged in → redirect to login
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Not verified → redirect to email verify
  if (!userData.isAccountVerified) {
    return <Navigate to="/email-verify" replace />;
  }

  // ✅ Logged in and verified → render protected page
  return children;
};

export default ProtectedRoute;