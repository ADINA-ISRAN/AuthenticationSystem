import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Login = () => {
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    backendURL,
    setIsLoggedIn,
    setUserData,
    getUserData,
    isLoggedIn,
    userData,
  } = useContext(AppContext);

  const navigate = useNavigate();

  const getErrorMessage = (error, fallback) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    );
  };

  // keep minimal: no navigation from useEffect
  useEffect(() => {
    if (isLoggedIn && userData) {
      console.log("user logged in and context synced", userData);
    }
  }, [isLoggedIn, userData]);


  const routeAfterLogin = async (user) => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    navigate("/", { replace: true });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    axios.defaults.withCredentials = true;

    try {
      if (isCreateAccount) {
        const registerRes = await axios.post(`${backendURL}/register`, {
          name,
          email,
          password,
        });

        toast.success("Account created successfully");

        const createdUser = registerRes?.data || null;
        if (createdUser) {
          setUserData(createdUser);
          setIsLoggedIn(true);
        }

        // Auto-login newly created users so protected pages work after verification.
        const loginRes = await axios.post(`${backendURL}/login`, {
          email,
          password,
        });

        const loginUser = loginRes?.data?.user || null;

        if (loginUser) {
          setUserData(loginUser);
        }
        setIsLoggedIn(true);

        const apiUser = await getUserData();
        const effectiveUser = apiUser || loginUser || createdUser;

        await routeAfterLogin(effectiveUser || { email });
      } else {
        const res = await axios.post(`${backendURL}/login`, {
          email,
          password,
        });

        if (res.status === 200) {
          const loginUser = res?.data?.user || null;

          // 1) Set immediate auth state for UI.
          if (loginUser) {
            setUserData(loginUser);
          }
          setIsLoggedIn(true);

          // 2) Get latest user data from /me and merge.
          const apiUser = await getUserData();
          const effectiveUser = apiUser || loginUser;

          console.log("login success", {
            resDataUser: loginUser,
            apiUser,
            effectiveUser,
          });

          toast.success("Login successful");

          // 3) Navigate based on verification state.
          await routeAfterLogin(effectiveUser);
        } else {
          console.log("login failed status", res.status, res.data);
        }
      }
    } catch (err) {
      if (isCreateAccount && err?.response?.status === 409) {
        toast.error("Email already exists. Please login instead.");
        setIsCreateAccount(false);
        setName("");
        setPassword("");
      } else {
        toast.error(getErrorMessage(err, "Something went wrong"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      {/* LOGO */}
      <Link to="/" className="auth-logo">
        <img src={assets.logo || assets.login} alt="logo" />
        <span>Authify</span>
      </Link>

      {/* CARD */}
      <div className="auth-card">
        <h2>
          {isCreateAccount ? "Create Account" : "Login"}
        </h2>

        <form onSubmit={onSubmitHandler}>

          {isCreateAccount && (
            <input
              type="text"
              placeholder="Full Name"
              required
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            required
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Link to="/reset-password" className="auth-link">
            Forgot password?
          </Link>

          <button disabled={loading}>
            {loading
              ? "Please wait..."
              : isCreateAccount
              ? "Sign Up"
              : "Login"}
          </button>
        </form>

        {/* TOGGLE */}
        <p>
          {isCreateAccount ? (
            <>
              Already have an account?{" "}
              <span onClick={() => {
                setIsCreateAccount(false);
                setName("");
                setEmail("");
                setPassword("");
              }}>
                Login here
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span onClick={() => {
                setIsCreateAccount(true);
                setName("");
                setEmail("");
                setPassword("");
              }}>
                Sign Up
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;