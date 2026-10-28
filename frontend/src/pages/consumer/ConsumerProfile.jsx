import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConsumerSidebar from "../../components/consumer/ConsumerSidebar";
import {
  getMyProfile,
  updateMyProfile,
  logoutUser,
} from "../../services/authService";
import "./Consumer.css";

const initialForm = {
  name: "",
  username: "",
  email: "",
  phone: "",
  address: "",
  district: "",
};

const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa",
  "Colombo", "Galle", "Gampaha", "Hambantota",
  "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale",
  "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
];

function ConsumerProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(initialForm);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        if (!sessionStorage.getItem("goviToken")) {
          navigate("/login/consumer", { replace: true });
          return;
        }

        const user = await getMyProfile();

        if (!active) return;

        if (user.role !== "consumer") {
          setError("This page is available to consumer accounts only.");
          return;
        }

        const values = {
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          district: user.district || "",
        };

        setProfile(values);
        setForm(values);
      } catch (err) {
        if (!active) return;

        if (
          err.message?.toLowerCase().includes("token") ||
          err.message?.toLowerCase().includes("log in")
        ) {
          logoutUser();
          navigate("/login/consumer", { replace: true });
          return;
        }

        setError(err.message || "Unable to load your profile.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.name.trim() || !form.username.trim()) {
      setError("Name and username are required.");
      return;
    }

    if (form.phone && !/^0\d{9}$/.test(form.phone.trim())) {
      setError("Enter a valid 10-digit phone number starting with 0.");
      return;
    }

    try {
      setSaving(true);

      const updatedUser = await updateMyProfile({
        name: form.name.trim(),
        username: form.username.trim(),
        phone: form.phone.trim(),
   
        address: form.address.trim(),
        district: form.district,
      });

      const values = {
        name: updatedUser.name || "",
        username: updatedUser.username || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",

        address: updatedUser.address || "",
        district: updatedUser.district || "",
      };

      setProfile(values);
      setForm(values);
      setEditing(false);
      setMessage("Your profile was updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(profile);
    setEditing(false);
    setMessage("");
    setError("");
  };

  const handleSignOut = () => {
    logoutUser();
    navigate("/", { replace: true });
  };

  const fields = [
    { name: "name", label: "Full Name", required: true },
    { name: "username", label: "Username", required: true },
    { name: "email", label: "Email Address", readOnly: true },
    { name: "phone", label: "Phone Number", type: "tel" },
    { name: "address", label: "Address" },
    { name: "district", label: "District", select: true },
 
  ];

  return (
    <div className="consumer-dashboard">
      <ConsumerSidebar />

      <main className="consumer-dashboard-main">
        <header className="consumer-dashboard-header">
          <div>
            <p className="consumer-eyebrow">CONSUMER PORTAL</p>
            <h1>My Profile</h1>
            <p>View and manage your GoviMart account details.</p>
          </div>
        </header>

        {loading ? (
          <section className="consumer-orders-message">
            <p>Loading your profile...</p>
          </section>
        ) : (
          <section
            style={{
              maxWidth: "900px",
              marginTop: "28px",
              padding: "32px",
              background: "#fff",
              border: "1px solid #e2e9df",
              borderRadius: "20px",
              boxShadow: "0 8px 28px rgba(35, 65, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                flexWrap: "wrap",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  width: "76px",
                  height: "76px",
                  borderRadius: "50%",
                  background: "#e7f0e3",
                  color: "#315b3b",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "30px",
                  fontWeight: 700,
                }}
              >
                {(profile.name || "C").charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 6px", color: "#294631" }}>
                  {profile.name || "Consumer"}
                </h2>
                <p style={{ margin: 0, color: "#718071" }}>
                  GoviMart Consumer
                </p>
                <p style={{ margin: "5px 0 0", color: "#718071" }}>
                  {profile.email}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                style={signOutButton}
              >
                Sign Out
              </button>
            </div>

            <hr
              style={{
                border: 0,
                borderTop: "1px solid #e6ece4",
                marginBottom: "26px",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, color: "#294631" }}>
                Personal Information
              </h2>

              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setMessage("");
                    setError("");
                    setEditing(true);
                  }}
                  style={primaryButton}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message && (
              <p style={successMessage}>{message}</p>
            )}

            {error && (
              <p style={errorMessage}>{error}</p>
            )}

            <form onSubmit={handleSave}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "22px",
                }}
              >
                {fields.map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: 600,
                        color: "#465b49",
                      }}
                    >
                      {field.label}
                      {field.required ? " *" : ""}
                    </label>

                    {editing && field.select ? (
                      <select
                        id={field.name}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                      >
                        <option value="">Select district</option>
                        {districts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type || "text"}
                        value={editing ? form[field.name] : profile[field.name]}
                        onChange={handleChange}
                        readOnly={!editing || field.readOnly}
                        required={Boolean(field.required)}
                        style={{
                          ...inputStyle,
                          background:
                            !editing || field.readOnly ? "#f4f7f2" : "#fff",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "28px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 600,
                    color: "#465b49",
                  }}
                >
                  Account Role
                </label>
                <input
                  value="Consumer"
                  readOnly
                  style={{ ...inputStyle, background: "#f4f7f2" }}
                />
              </div>

              {editing && (
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "28px",
                  }}
                >
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      ...primaryButton,
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    style={cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>

            <p
              style={{
                marginTop: "24px",
                color: "#778477",
                fontSize: "13px",
              }}
            >
              Your email address and account role cannot be edited here.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

const primaryButton = {
  border: "none",
  borderRadius: "9px",
  background: "#386443",
  color: "#fff",
  padding: "12px 20px",
  fontWeight: 600,
  cursor: "pointer",
};

const signOutButton = {
  ...primaryButton,
  background: "#fff",
  color: "#a33c35",
  border: "1px solid #e6c9c5",
};

const cancelButton = {
  border: "1px solid #d5dfd3",
  borderRadius: "9px",
  background: "#fff",
  color: "#385440",
  padding: "12px 20px",
  fontWeight: 600,
  cursor: "pointer",
};

const inputStyle = {
  boxSizing: "border-box",
  width: "100%",
  minHeight: "46px",
  padding: "12px 14px",
  border: "1px solid #dce5da",
  borderRadius: "9px",
  color: "#2d4533",
  fontSize: "15px",
};

const successMessage = {
  padding: "12px 14px",
  borderRadius: "8px",
  background: "#eaf6e9",
  color: "#28643a",
};

const errorMessage = {
  padding: "12px 14px",
  borderRadius: "8px",
  background: "#fff0ee",
  color: "#a33c35",
};

export default ConsumerProfile;
