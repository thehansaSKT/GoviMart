import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyProfile,
  logoutUser,
} from "../../services/authService";
import "./Auth.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load profile.");
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Unable to load profile</h1>
          <div className="auth-error">{error}</div>
          <Link to="/">Return to login</Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="profile-loading">Loading your profile...</div>;
  }

  return (
    <div className="auth-page">
      <div className="auth-card profile-card">
        <div className="profile-avatar">👤</div>
        <h1>My Profile</h1>
        <p>Your GoviMart account information.</p>

        <div className="profile-role">
          {user.role === "farmer" ? "🌱 Farmer Account" : "🛒 Consumer Account"}
        </div>

        <div className="profile-details">
          <p><strong>Full Name</strong><span>{user.name}</span></p>
          <p><strong>Username</strong><span>{user.username}</span></p>
          <p><strong>Email</strong><span>{user.email}</span></p>
          <p><strong>Phone</strong><span>{user.phone || "Not provided"}</span></p>
          {user.role === "farmer" && (
            <p><strong>Farm Name</strong><span>{user.farmName || "Not provided"}</span></p>
          )}
          <p><strong>District</strong><span>{user.district || "Not provided"}</span></p>
          <p><strong>Address</strong><span>{user.address || "Not provided"}</span></p>
        </div>

        <Link className="profile-back-link" to={
          user.role === "farmer" ? "/farmer/dashboard" : "/consumer"
        }>
          Back to {user.role === "farmer" ? "Farmer Dashboard" : "Consumer Home"}
        </Link>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}