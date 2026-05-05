import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import Menubar from "../components/Menubar";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { userData, backendURL, setUserData } = useContext(AppContext);

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Sync user data
  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setPreview(userData.image || "");
    }
  }, [userData]);

  // 🧹 Cleanup preview URL properly
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // 📸 Handle image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);

    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);
  };

  // 💾 Update profile
  const handleUpdate = async () => {
    if (loading) return;

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      axios.defaults.withCredentials = true;

      const formData = new FormData();
      formData.append("name", name.trim());
      if (image) formData.append("image", image);

      const res = await axios.put(
        `${backendURL}/update-profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200) {
        const updatedUser = res?.data?.user;

        if (updatedUser) {
          setUserData(updatedUser);
        }

        toast.success("Profile updated ✅");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Update failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7ff" }}>
      <Menubar />

      <div className="container mt-5">
        <div className="dashboard-card p-4 text-center">

          <h3 className="mb-4">👤 Profile</h3>

          {/* PROFILE IMAGE */}
          <div className="mb-4">
            <img
              src={
                preview ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="profile"
              className="rounded-circle shadow"
              width={120}
              height={120}
              style={{ objectFit: "cover" }}
            />

            {/* Upload */}
            <div className="mt-3">
              <label className="btn btn-outline-primary btn-sm">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {/* NAME */}
          <div className="mb-3 text-start">
            <label className="fw-semibold mb-1">Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <p><strong>Email:</strong> {userData?.email}</p>

          {/* STATUS */}
          <p>
            <strong>Status:</strong>{" "}
            {userData?.isAccountVerified
              ? "Verified ✅"
              : "Not Verified ❌"}
          </p>

          {/* BUTTON */}
          <button
            className="btn btn-primary mt-3 px-4"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default Profile;