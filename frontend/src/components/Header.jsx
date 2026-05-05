import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="container text-center text-white d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "85vh" }}>
      
      {/* TITLE */}
      <h5 className="fw-semibold mb-3">
        Hey {userData?.name || "Developer"} 👋
      </h5>

      <h1 className="fw-bold display-3 mb-3">
        Authify
      </h1>

      <h2 className="fw-bold mb-4">
        Secure Authentication Made Simple
      </h2>

      <p className="fs-5 mb-4 col-md-8">
        Build, manage, and scale authentication effortlessly with our modern platform. 
        Get started in minutes 🚀
      </p>

      {/* BUTTONS */}
      <div className="d-flex gap-3 mb-5">
        <button
          className="btn premium-btn px-4 py-2 rounded-pill"
          onClick={() => navigate("/login")}
        >
          Get Started 🚀
        </button>

        <button className="btn btn-outline-light px-4 py-2 rounded-pill">
          Learn More
        </button>
      </div>

      {/* IMAGE */}
      <img
        src={assets.header}
        alt="header"
        className="img-fluid mb-3"
        style={{ maxWidth: "500px" }}
      />

      {/* SMALL TEXT BELOW IMAGE */}
      <p className="small text-light opacity-75">
        Trusted by developers worldwide 🌍
      </p>

    </div>
  );
};

export default Header;