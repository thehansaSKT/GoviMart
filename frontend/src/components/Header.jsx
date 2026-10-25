import { useEffect, useState } from "react";
import { getProfile } from "../services/userService";

function Header() {
  const [farmerName, setFarmerName] = useState("Farmer");

  useEffect(() => {
    let cancelled = false;

    const loadFarmerName = async () => {
      const profileId = localStorage.getItem("govimartProfileId");

      if (!profileId) {
        setFarmerName("Farmer");
        return;
      }

      try {
        const result = await getProfile(profileId);

        if (!cancelled) {
          const name = result.user?.name || "Farmer";
          setFarmerName(name);

          localStorage.setItem(
            "govimartProfile",
            JSON.stringify(result.user)
          );
        }
      } catch (error) {
        console.error("Failed to load farmer name:", error);
      }
    };

    loadFarmerName();

    window.addEventListener("govimart-profile-updated", loadFarmerName);

    return () => {
      cancelled = true;
      window.removeEventListener("govimart-profile-updated", loadFarmerName);
    };
  }, []);

  return (
    <header className="topbar">
      <div>
        <p className="topbar-label">FARMER PORTAL</p>
        <h2>Dashboard</h2>
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
