import { assets } from "../assets/assets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const EmailVerify = () => {
  const inputRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const { getUserData, isLoggedIn, userData, backendURL } =
    useContext(AppContext);

  const targetEmail = location.state?.email || userData?.email || "";

  const navigate = useNavigate();

  // 🔥 Auto focus first input
  useEffect(() => {
    inputRef.current[0]?.focus();
  }, []);

  // 🔢 Handle input
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    e.target.value = value;

    if (value && index < 5) {
      inputRef.current[index + 1]?.focus();
    }
  };

  // ⌫ Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRef.current[index - 1]?.focus();
    }

    // 🔥 Enter key support
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  // 📋 Paste OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    paste.forEach((digit, i) => {
      if (inputRef.current[i]) {
        inputRef.current[i].value = digit;
      }
    });

    inputRef.current[paste.length - 1]?.focus();
  };

  // ✅ Verify OTP
  const handleVerify = async () => {
    const otp = inputRef.current
      .map((input) => input?.value || "")
      .join("");

    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits of the OTP");
      return;
    }

    setLoading(true);
    axios.defaults.withCredentials = true;

    try {
      const response = await axios.post(
        `${backendURL}/verify-otp`,
        { email: targetEmail, otp }
      );

      if (response.status === 200) {
        toast.success("OTP verified successfully!");
        await getUserData();
        navigate("/", { replace: true });
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to verify OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Redirect if already verified
  useEffect(() => {
    if (isLoggedIn && userData?.isAccountVerified) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, userData, navigate]);

  return (
    <div className="email-verify-page">
      {/* Logo */}
      <Link
        to="/"
        className="email-verify-logo d-flex align-items-center gap-2 text-decoration-none"
      >
        <img
          src={assets.logo_home || ""}
          alt="logo"
          height={32}
          width={32}
        />
        <span>Authify</span>
      </Link>

      <div className="email-verify-shell">
        {/* Card */}
        <div className="email-verify-card text-center">
        <h4 className="fw-bold mb-2">Email Verify OTP</h4>

        <p className="mb-4">
          Enter the 6 digit code sent to {targetEmail || "your email"}.
        </p>

        {/* OTP INPUT */}
        <div className="email-verify-otp-row mb-4">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              inputMode="numeric"
              className="email-verify-otp-input"
              ref={(el) => (inputRef.current[i] = el)}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        {/* BUTTON */}
        <button
          className="email-verify-button fw-semibold"
          disabled={loading}
          onClick={handleVerify}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        {!targetEmail && (
          <p className="mt-3 text-danger small mb-0">
            Missing email context. Go back to login or signup and try again.
          </p>
        )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;