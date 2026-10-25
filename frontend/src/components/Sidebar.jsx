function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img
          src="/govimart-logo.png"
          alt="GoviMart logo"
          className="brand-logo"
        />
        <h2>GoviMart</h2>
      </div>

      <p className="menu-heading">FARMER MENU</p>

      <nav className="sidebar-nav">
        <a href="#dashboard" className="nav-link active">
          <span>▦</span> Dashboard
        </a>

        <a href="#products" className="nav-link">
          <span>▣</span> My Products
        </a>

        <a href="#add-product" className="nav-link">
          <span>＋</span> Add Product
        </a>

        <a href="#orders" className="nav-link">
          <span>▤</span> Orders
        </a>

        <a href="#profile" className="nav-link">
          <span>◉</span> My Profile
        </a>
      </nav>

      <div className="sidebar-footer">
        <span>🌱</span>
        <p>Growing together, from farm to home.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
