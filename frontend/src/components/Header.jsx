function Header() {
  return (
    <header className="topbar">
      <div>
        <p className="topbar-label">FARMER PORTAL</p>
        <h2>Dashboard</h2>
      </div>

      <div className="farmer-profile">
        <div className="profile-avatar">F</div>

        <div>
          <strong>Farmer</strong>
          <p>GoviMart Member</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
