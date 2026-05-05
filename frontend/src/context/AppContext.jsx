import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AppConstants } from "../util/constants";

// ✅ Context
export const AppContext = createContext();

// ✅ Provider
export const AppContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); // 🔥 start with true

  const backendURL = AppConstants.BACKEND_URL;

  // 🔔 Add notification
  const addNotification = (msg) => {
    setNotifications((prev) => [...prev, msg]);
  };

  // 👤 Fetch user data
  const getUserData = useCallback(async () => {
    try {
      axios.defaults.withCredentials = true;

      const res = await axios.get(`${backendURL}/profile`);
      const profile = res.data?.user || res.data;

      if (res.status === 200 && profile) {
        setUserData(profile);
        setIsLoggedIn(true);
        return profile;
      }

      setUserData(null);
      setIsLoggedIn(false);
      return null;
    } catch (error) {
      setUserData(null);
      setIsLoggedIn(false);
      return null;
    } finally {
      setLoading(false); // 🔥 stop loading ALWAYS
    }
  }, [backendURL]);

  // 🔥 Auto run on app start
  useEffect(() => {
    getUserData();
  }, [getUserData]);

  return (
    <AppContext.Provider
      value={{
        // 👤 Auth
        userData,
        setUserData,
        isLoggedIn,
        setIsLoggedIn,

        // 🌙 Theme
        darkMode,
        setDarkMode,

        // 🔔 Notifications
        notifications,
        setNotifications,
        addNotification,

        // ⏳ Loader
        loading,
        setLoading,

        // 🌐 Backend
        backendURL,
        getUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};