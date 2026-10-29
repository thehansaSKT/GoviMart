import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/farmer/Sidebar";
import Header from "../../components/farmer/Header";
import {
  getMyProfile,
  updateMyProfile,
  logoutUser,
} from "../../services/authService";
import "./Farmer.css";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  farmName: "",
  address: "",
  district: "",
};

function MyProfile() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoadingProfile(true);
      setError("");

      try {
        const user = await getMyProfile();

        if (cancelled) return;

        if (user?.role !== "farmer") {
          navigate("/", { replace: true });
          return;
        }

        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          farmName: user.farmName || "",
          address: user.address || "",
          district: user.district || "",
        });
      } catch (err) {
        if (cancelled) return;

        console.error("Unable to load farmer profile:", err);

        setError(
          err.message ||
            "Could not load your profile. Please check your backend connection."
        );
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

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

  const handleCancel = async () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    setLoadingProfile(true);

    try {
      const user = await getMyProfile();

      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        farmName: user.farmName || "",
        address: user.address || "",
        district: user.district || "",
      });
    } catch (err) {
      setError(err.message || "Could not reload your saved profile.");
    } finally {
      setLoadingProfile(false);
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
      district: formData.district.trim(),
    };

    if (!cleanedData.name || !cleanedData.email) {
      setError("Full name and email address are required.");
      return;
    }

    if (
      cleanedData.phone &&
      !/^0\d{9}$/.test(cleanedData.phone)
    ) {
      setError("Enter a valid 10-digit phone number starting with 0.");
      return;
    }

    setLoading(true);

    try {
      const result = await updateMyProfile(cleanedData);
      const savedUser = result.user;

      if (!savedUser) {
        throw new Error("The server did not return the updated profile.");
      }

      localStorage.setItem("goviUser", JSON.stringify(savedUser));

      setFormData({
        name: savedUser.name || "",
        email: savedUser.email || "",
        phone: savedUser.phone || "",
        farmName: savedUser.farmName || "",
        address: savedUser.address || "",
        district: savedUser.district || "",
      });

      window.dispatchEvent(new Event("govi-profile-updated"));
      window.dispatchEvent(new Event("govimart-profile-updated"));

      setIsEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Unable to save farmer profile:", err);

      setError(
        err.message ||
          "Failed to save your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    const confirmed = window.confirm(
      "Are you sure you want to sign out?"
    );

    if (!confirmed) return;

    logoutUser();
    navigate("/", { replace: true });
  };

  return (
    <div className="farmer-dashboard">
      <Sidebar />

      <main className="main-content">
        <Header title="My Profile" />

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
                        placeholder="0771234567"
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

                  <div className="profile-field">
                    <label htmlFor="district">District</label>

                    {isEditing ? (
                      <input
                        id="district"
                        name="district"
                        type="text"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="Enter your district"
                      />
                    ) : (
                      <strong>{formData.district || "Not provided"}</strong>
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

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleSignOut}
                  >
                    Sign Out
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
