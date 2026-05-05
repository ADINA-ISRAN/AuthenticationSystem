import Menubar from "../components/Menubar";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
  const { userData, backendURL } = useContext(AppContext);
  const navigate = useNavigate();

  const handleVerifyNow = async () => {
    try {
      axios.defaults.withCredentials = true;

      const response = await axios.post(`${backendURL}/send-otp`, {
        email: userData?.email,
      });

      if (response.status === 200) {
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

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "User Activity",
        data: [10, 20, 15, 30, 25],
        backgroundColor: "#6a5af9",
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>

      {/* SIDEBAR */}
      <div className="sidebar p-4 text-white">
        <h4 className="fw-bold mb-4">Authify</h4>

        <div className="nav flex-column gap-2">
          <span className="nav-link active">🏠 Dashboard</span>

          <span
            className="nav-link"
            onClick={() => navigate("/profile")}
          >
            👤 Profile
          </span>

          <span className="nav-link">⚙️ Settings</span>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-grow-1 dashboard-content">
        <Menubar />

        <div className="container mt-4">
          <h3 className="mb-4">
            Welcome, {userData?.name || "User"} 👋
          </h3>

          {userData && !userData.isAccountVerified && (
            <div className="alert alert-warning" role="alert">
              Your email is not verified yet. Please complete OTP verification.
              <button
                className="btn btn-sm btn-primary ms-2"
                onClick={handleVerifyNow}
              >
                Verify now
              </button>
            </div>
          )}

          {/* CHART CARD */}
          <div className="dashboard-card p-4">
            <h5 className="mb-3">📊 User Activity</h5>

            <div style={{ width: "100%", overflowX: "auto" }}>
              <Bar data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;