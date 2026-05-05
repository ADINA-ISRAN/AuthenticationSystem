import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext, useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const ResetPassword = () => {
  const inputRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const { backendURL } = useContext(AppContext);

  const getErrorMessage = (error, fallback) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    );
  };

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const initialEmail = location.state?.email || "";

  // ✅ set axios once
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // 🔢 Handle input
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    e.target.value = value;

    if (value && index < 5) {
      inputRef.current[index + 1]?.focus();
    }
  };

  // ⌫ Backspace + Enter
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRef.current[index - 1]?.focus();
    }

    if (e.key === "Enter") {
      handleVerifyOTP();
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

  // 📧 Send OTP
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    if (loading) return;

    console.log("Sending reset OTP for email:", email);

    setLoading(true);

    try {
      const res = await axios.post(
        `${backendURL}/send-reset-otp`,
        { email: email.trim() }
      );

      console.log("Send reset OTP response:", res);

      if (res.status === 200) {
        toast.success("OTP sent successfully");
        setIsEmailSent(true);
      }
    } catch (err) {
      console.error("Send reset OTP error:", err);
      toast.error(getErrorMessage(err, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  // 🔢 Verify OTP
  const handleVerifyOTP = () => {
    const code = inputRef.current
      .map((i) => i?.value || "")
      .join("");

    console.log("Verifying OTP:", code);

    if (code.length !== 6) {
      toast.error("Enter full OTP");
      return;
    }

    setOtp(code);
    setIsOtpVerified(true);
    console.log("OTP verified, moving to password step");
  };

  // 🔐 Reset Password
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    if (loading) return;

    console.log("Resetting password for email:", email, "with OTP:", otp);

    if (!newPassword.trim()) {
      toast.error("Password cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${backendURL}/reset-password`,
        {
          email: email.trim(),
          otp,
          newPassword: newPassword.trim(),
        }
      );

      console.log("Reset password response:", res);

      if (res.status === 200) {
        toast.success("Password reset successful");
        navigate("/login");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error(getErrorMessage(err, "Reset failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container reset-password-page">
      {/* Logo */}
      <Link
        to="/"
        className="reset-password-logo d-flex align-items-center gap-2 text-decoration-none"
      >
        <img src={assets.logo || ""} alt="logo" height={32} />
        <span className="text-light fw-semibold fs-4">
          Authify
        </span>
      </Link>

      <div className="reset-password-shell">
        {/* STEP 1 */}
        {!isEmailSent && (
          <div className="reset-password-card auth-card">
            <h4 className="text-center mb-3">Reset Password</h4>

            <form onSubmit={onSubmitEmail}>
              <input
                type="email"
                className="form-control mb-3"
                placeholder="Enter email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2 */}
        {isEmailSent && !isOtpVerified && (
          <div className="reset-password-card auth-card">
            <h5 className="text-center mb-3">Enter OTP</h5>

            <div className="d-flex gap-2 mb-3 reset-password-otp-row">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  maxLength={1}
                  inputMode="numeric"
                  className="reset-password-otp-input"
                  ref={(el) => (inputRef.current[i] = el)}
                  onChange={(e) => handleChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            <p className="text-muted small text-center mb-3">
              The code will be validated when you submit the new password.
            </p>

            <button className="btn btn-primary w-100" onClick={handleVerifyOTP}>
              Continue
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {isOtpVerified && (
          <div className="reset-password-card auth-card">
            <h5 className="text-center mb-3">New Password</h5>

            <form onSubmit={onSubmitNewPassword}>
              <input
                type="password"
                className="form-control mb-3"
                placeholder="Enter new password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;