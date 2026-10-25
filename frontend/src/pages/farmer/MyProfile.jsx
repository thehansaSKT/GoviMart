import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  createProfile,
  getProfile,
  updateProfile,
} from "../../services/userService";
import "../../App.css";

function MyProfile() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [profileId, setProfileId] = useState(
    localStorage.getItem("govimartProfileId") || ""
  );
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "Farmer",
    email: "",
    phone: "",
    farmName: "",
    address: "",
  });

  useEffect(() => {
    if (!profileId) return;

    let cancelled = false;

    const loadProfile = async () => {
      setLoadingProfile(true);
      setError("");

      try {
        const result = await getProfile(profileId);

        if (cancelled) return;

        const user = result.user;

        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          farmName: user.farmName || "",
          address: user.address || "",
        });
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            "Could not load your profile. Please check your backend connection."
        );
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setError("");
    setSuccess("");
    setIsEditing(false);

    if (profileId) {
      getProfile(profileId)
        .then(({ user }) => {
          setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            farmName: user.farmName || "",
            address: user.address || "",
          });
        })
        .catch(() => {
          setError("Could not reload your saved profile.");
        });
    } else {
      setFormData({
        name: "Farmer",
        email: "",
        phone: "",
        farmName: "",
        address: "",
      });
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      farmName: formData.farmName.trim(),
      address: formData.address.trim(),
    };

    if (!cleanedData.name || !cleanedData.email) {
      setError("Full name and email address are required.");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (profileId) {
        result = await updateProfile(profileId, cleanedData);
      } else {
        result = await createProfile(cleanedData);
      }

      const savedUser = result.user;

      if (!savedUser?._id) {
        throw new Error("The server did not return a saved profile ID.");
      }

      localStorage.setItem("govimartProfileId", savedUser._id);
      setProfileId(savedUser._id);

      localStorage.setItem(
  "govimartProfile",
  JSON.stringify(savedUser)
);

window.dispatchEvent(new Event("storage"));
      setFormData({
        name: savedUser.name || "",
        email: savedUser.email || "",
        phone: savedUser.phone || "",
        farmName: savedUser.farmName || "",
        address: savedUser.address || "",
      });

      setIsEditing(false);
      setSuccess("Profile saved successfully to MongoDB!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save your profile. Check your backend and database connection."
      );
    } finally {
      setLoading(false);
    }
  };
 

window.dispatchEvent(new Event("storage"));
  return (
    <div className="farmer-dashboard">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="content-panel profile-panel">
          <div className="panel-heading">
            <div>
              <h2>My Profile</h2>
              <p>View and manage your farmer information.</p>
            </div>

            {!isEditing && (
              <button
                type="button"
                className="primary-button"
                onClick={handleEdit}
                disabled={loadingProfile}
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="form-success" role="status">
              {success}
            </p>
          )}

          {loadingProfile ? (
            <div className="profile-card">
              <p>Loading profile...</p>
            </div>
          ) : (
            <div className="profile-card">
              <div className="profile-avatar-large">
                {(formData.name || "F").charAt(0).toUpperCase()}
              </div>

              <h3>{formData.name || "Farmer"}</h3>
              <p className="profile-role">GoviMart Farmer</p>

              <form onSubmit={handleSave}>
                <div className="profile-details">
                  <div className="profile-field">
                    <label htmlFor="name">Full Name</label>

                    {isEditing ? (
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        minLength={2}
                        maxLength={100}
                        required
                      />
                    ) : (
                      <strong>{formData.name || "Not provided"}</strong>
                    )}
                  </div>

                  <div className="profile-field">
                    <label htmlFor="email">Email Address</label>

                    {isEditing ? (
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    ) : (
                      <strong>{formData.email || "Not provided"}</strong>
                    )}
                  </div>

                  <div className="profile-field">
                    <label htmlFor="phone">Phone Number</label>

                    {isEditing ? (
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <strong>{formData.phone || "Not provided"}</strong>
                    )}
                  </div>

                  <div className="profile-field">
                    <label htmlFor="farmName">Farm Name</label>

                    {isEditing ? (
                      <input
                        id="farmName"
                        name="farmName"
                        type="text"
                        value={formData.farmName}
                        onChange={handleChange}
                        placeholder="Enter your farm name"
                      />
                    ) : (
                      <strong>{formData.farmName || "Not provided"}</strong>
                    )}
                  </div>

                  <div className="profile-field">
                    <label htmlFor="address">Farm Address</label>

                    {isEditing ? (
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter your farm address"
                      />
                    ) : (
                      <strong>{formData.address || "Not provided"}</strong>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="product-form-actions">
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>

              {!isEditing && (
                <div className="product-form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => navigate("/farmer/dashboard")}
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MyProfile;
