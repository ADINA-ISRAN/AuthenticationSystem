import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useContext } from "react";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";

// Context
import { AppContext } from "./context/AppContext";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { darkMode, loading } = useContext(AppContext);

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      
      {/* 🔔 Toast */}
      <ToastContainer position="top-right" autoClose={2000} />

      {/* ⏳ Loader */}
      {loading && <Loader />}

      {/* 🌐 Routes */}
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>
    </div>
  );
};

export default App;