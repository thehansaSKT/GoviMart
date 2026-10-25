
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ onAddProduct }) {
  const navigate = useNavigate();
  const location = useLocation();

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
        <a
          href="/farmer/dashboard"
          className={`nav-link ${
            location.pathname === "/farmer/dashboard" ? "active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            navigate("/farmer/dashboard");
          }}
        >
          <span>▦</span> Dashboard
        </a>

        <a
          href="/farmer/products"
          className={`nav-link ${
            location.pathname === "/farmer/products" ? "active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            navigate("/farmer/products");
          }}
        >
          <span>▣</span> My Products
        </a>

        <a
          href="/farmer/add-product"
          className={`nav-link ${
            location.pathname === "/farmer/add-product" ? "active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();

            if (typeof onAddProduct === "function") {
              onAddProduct();
            } else {
              navigate("/farmer/add-product");
            }
          }}
        >
          <span>＋</span> Add Product
        </a>

        <a
          href="/farmer/orders"
          className={`nav-link ${
            location.pathname === "/farmer/orders" ? "active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            navigate("/farmer/orders");
          }}
        >
          <span>▤</span> Orders
        </a>

        <a
          href="/farmer/profile"
          className={`nav-link ${
            location.pathname === "/farmer/profile" ? "active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            navigate("/farmer/profile");
          }}
        >
          <span>◉</span> My Profile
        </a>
        
      </nav>

      
<div className="sidebar-footer">
  <img
    src="/govimart-farmer-banner.png"
    alt="Growing together, from farm to home. Your farm, your marketplace."
    className="sidebar-footer-image"
  />
</div>

    </aside>
  );
}

export default Sidebar;
