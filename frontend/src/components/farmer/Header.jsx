import { useEffect, useState } from "react";
import { getMyProfile } from "../services/authService";

function Header({ title = "Dashboard" }) {
  const [farmerName, setFarmerName] = useState(() => {
    try {
      const user = JSON.parse(
        sessionStorage.getItem("goviUser") || "null"
      );

      return user?.name || "Farmer";
    } catch {
      return "Farmer";
    }
  });

  useEffect(() => {
    let cancelled = false;

    const loadFarmerName = async () => {
      try {
        const user = await getMyProfile();

        if (!cancelled) {
          setFarmerName(user?.name || "Farmer");
        }
      } catch (error) {
        console.error("Failed to load farmer name:", error);

        if (!cancelled) {
          try {
            const user = JSON.parse(
              sessionStorage.getItem("goviUser") || "null"
            );

            setFarmerName(user?.name || "Farmer");
          } catch {
            setFarmerName("Farmer");
          }
        }
      }
    };

    const handleProfileUpdate = () => {
      try {
        const user = JSON.parse(
          sessionStorage.getItem("goviUser") || "null"
        );

        setFarmerName(user?.name || "Farmer");
      } catch {
        setFarmerName("Farmer");
      }
    };

    loadFarmerName();

    window.addEventListener(
      "govi-profile-updated",
      handleProfileUpdate
    );

    window.addEventListener(
      "govimart-profile-updated",
      handleProfileUpdate
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "govi-profile-updated",
        handleProfileUpdate
      );

      window.removeEventListener(
        "govimart-profile-updated",
        handleProfileUpdate
      );
    };
  }, []);

  return (
    <header className="topbar">
      <div>
        <p className="topbar-label">FARMER PORTAL</p>
        <h2>{title}</h2>
      </div>

      <div className="farmer-profile">
        <div className="profile-avatar">
          {farmerName.charAt(0).toUpperCase()}
        </div>

        <div>
          <strong>{farmerName}</strong>
          <p>GoviMart Member</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
