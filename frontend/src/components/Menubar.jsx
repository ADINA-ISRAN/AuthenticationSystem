import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Menubar = () => {
  const navigate = useNavigate();

  const {
    userData,
    backendURL,
    setUserData,
    setIsLoggedIn,
    getUserData,
    darkMode,
    setDarkMode,
    notifications = [],
  } = useContext(AppContext);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🔽 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔐 Logout
  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;

      const response = await axios.post(`${backendURL}/logout`);

      if (response.status === 200) {
        setIsLoggedIn(false);
        setUserData(null);
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Logout failed"
      );
    }
  };

  // 📧 Send OTP
  const sendVerificationOTP = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDropdownOpen(false);

    axios.defaults.withCredentials = true;

    try {
      const response = await axios.post(`${backendURL}/send-otp`, { email: userData?.email });
      if (response && (response.status === 200 || response.status === 201)) {
        const devOtp = response?.data?.otp;
        if (devOtp) {
          toast.info(`Local dev OTP: ${devOtp}`);
        } else {
          toast.success("OTP sent successfully!");
        }
        const refreshedUser = await getUserData();
        if (refreshedUser?.isAccountVerified) {
          navigate("/");
        } else {
          navigate("/email-verify", { state: { email: userData?.email, otp: devOtp } });
        }
      } else {
        toast.error("Unable to send OTP");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to send OTP");
    }
  };

  return (
    <nav className="navbar px-4 py-3 d-flex justify-content-between align-items-center premium-navbar">

      {/* 🔰 LOGO */}
      <div
        className="d-flex align-items-center gap-2"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <img src={assets.logo_home} alt="logo" width={35} />
        <span className="fw-bold fs-4 text-dark">Authify</span>
      </div>

      {/* RIGHT SIDE */}
      <div className="d-flex align-items-center gap-3">

        {/* 🔔 Notifications */}
        <div className="position-relative">
          <i className="bi bi-bell fs-5"></i>
          {notifications.length > 0 && (
            <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
              {notifications.length}
            </span>
          )}
        </div>

        {/* 🌙 Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="btn btn-sm"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* 👤 USER / LOGIN */}
        {userData ? (
          <div className="position-relative" ref={dropdownRef}>

            {/* Avatar */}
            {userData?.image ? (
              <img
                src={userData.image}
                alt="user"
                className="rounded-circle nav-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
            ) : (
              <div
                className="nav-avatar d-flex justify-content-center align-items-center text-white"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {userData?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}

            {/* DROPDOWN */}
            {dropdownOpen && (
              <div className="nav-dropdown">
                <div
                  className="dropdown-item"
                  onClick={sendVerificationOTP}
                >
                  <i className="bi bi-envelope-check me-2"></i>
                  Verify Email
                </div>

                <div
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </div>

              </div>
            )}
          </div>
        ) : (
          /* 🔥 LOGIN ICON */
          <i
            className="bi bi-person-circle nav-icon"
            onClick={() => navigate("/login")}
            title="Login"
          ></i>
        )}
      </div>
    </nav>
  );
};

export default Menubar;
