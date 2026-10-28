import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ConsumerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const refreshCartCount = () => {
      try {
        const cart = JSON.parse(
          localStorage.getItem("govimartCart") || "[]"
        );

        const validCart = Array.isArray(cart) ? cart : [];

        setCartCount(validCart.length);
      } catch {
        setCartCount(0);
      }
    };

    refreshCartCount();

    window.addEventListener("storage", refreshCartCount);
    window.addEventListener("govimart-cart-updated", refreshCartCount);

    return () => {
      window.removeEventListener("storage", refreshCartCount);
      window.removeEventListener(
        "govimart-cart-updated",
        refreshCartCount
      );
    };
  }, [location.pathname]);

  const links = [
    { label: "Dashboard", icon: "▦", path: "/consumer" },
    {
      label: "Browse Products",
      icon: "▣",
      path: "/consumer/products",
    },
    { label: "My Cart", icon: "🛒", path: "/consumer/cart" },
    { label: "My Orders", icon: "▤", path: "/consumer/orders" },
    { label: "My Profile", icon: "◎", path: "/consumer/profile" },
  ];

  return (
    <aside className="consumer-sidebar">
      <div className="consumer-sidebar-brand">
        <img
          src="/govimart-logo.png"
          alt="GoviMart Logo"
          className="consumer-sidebar-logo"
        />
        <span>GoviMart</span>
      </div>

      <p className="consumer-sidebar-label">CONSUMER MENU</p>

      <nav className="consumer-sidebar-nav">
        {links.map((link) => {
          const isActive =
            link.path === "/consumer"
              ? location.pathname === "/consumer"
              : location.pathname === link.path ||
                location.pathname.startsWith(`${link.path}/`);

          return (
            <button
              key={link.path}
              type="button"
              className={`consumer-sidebar-link ${
                isActive ? "active" : ""
              }`}
              onClick={() => navigate(link.path)}
            >
              <span className="consumer-nav-icon">{link.icon}</span>
              <span>{link.label}</span>

              {link.path === "/consumer/cart" && cartCount > 0 && (
                <span className="consumer-sidebar-badge">
                  {cartCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="consumer-sidebar-image">
        <img
          src="/govimart-consumer-sidebar.png"
          alt="Woman shopping for fresh farm produce"
        />
      </div>
    </aside>
  );
}

export default ConsumerSidebar;