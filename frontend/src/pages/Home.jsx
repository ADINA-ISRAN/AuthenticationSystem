
import { assets } from "../assets/assets";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Home = () => {
  const {
    isLoggedIn,
    userData,
    backendURL,
    setUserData,
    setIsLoggedIn,
  } = useContext(AppContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;

      const response = await axios.post(`${backendURL}/logout`);

      if (response.status === 200) {
        setIsLoggedIn(false);
        setUserData(null);
        setDropdownOpen(false);
        toast.success("Logged out successfully");
        navigate("/", { replace: true });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Logout failed"
      );
    }
  };

  const sendVerificationOTP = async () => {
    try {
      axios.defaults.withCredentials = true;

      const response = await axios.post(`${backendURL}/send-otp`, {
        email: userData?.email,
      });

      if (response.status === 200) {
        setDropdownOpen(false);
        toast.success("OTP sent successfully!");
        navigate("/email-verify", {
          state: { email: userData?.email },
        });
      } else {
        toast.error("Unable to send OTP");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to send OTP"
      );
    }
  };

  return (
    <div className="home-container">

      {/* TOP NAV */}
      <div className="home-top-nav">
        {!isLoggedIn ? (
          <Link to="/login" className="home-top-nav-link">
            Login
          </Link>
        ) : (
          <div className="position-relative home-avatar-wrap" ref={dropdownRef}>
            {userData?.image ? (
              <button
                type="button"
                className="nav-avatar-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Open profile menu"
              >
                <img
                  src={userData.image}
                  alt="user"
                  className="nav-avatar"
                />
              </button>
            ) : (
              <button
                type="button"
                className="nav-avatar-trigger nav-avatar-fallback"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Open profile menu"
              >
                <span className="nav-avatar nav-avatar-initials text-white">
                  {userData?.name?.[0]?.toUpperCase() || "U"}
                </span>
              </button>
            )}

            {dropdownOpen && (
              <div className="nav-dropdown nav-dropdown-premium">
                <div
                  className="dropdown-item"
                  onClick={sendVerificationOTP}
                >
                  Verify Email
                </div>

                <div
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LOGO */}
      <div className="logo">
        <img src={assets.logo_home} alt="logo" />
        <span>Authify</span>
      </div>

      {/* CENTER CONTENT */}
      <div className="hero-center">
        
        {/* IMAGE */}
        <img
          src={assets.header}
          alt="header"
          className="hero-img"
        />

        {/* TEXT */}
        <h5>Hey Developer 👋</h5>

        <h1>Welcome to our product</h1>

        <p>
          Let's start with a quick product tour and you can setup
          the authentication in no time!
        </p>

        {/* BUTTON */}
        <button
          className="hero-btn"
          onClick={async () => {
            if (!isLoggedIn) {
              navigate("/login");
            } else {
              if (userData?.isAccountVerified) {
                navigate("/dashboard");
              } else {
                await sendVerificationOTP();
              }
            }
          }}
        >
          Get Started
        </button>

      </div>

    </div>
  );
};

export default Home;