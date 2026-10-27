import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllProducts } from "../../services/productService";
import "./Consumer.css";

function ConsumerHome() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [consumerName, setConsumerName] = useState("Consumer");
  const [loading, setLoading] = useState(true);

  const refreshDashboard = () => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("govimartCart") || "[]"
      );

      const validCart = Array.isArray(cart) ? cart : [];

      setCartCount(
        validCart.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )
      );

      const orders = JSON.parse(
        localStorage.getItem("govimartOrders") || "[]"
      );

      const validOrders = Array.isArray(orders) ? orders : [];

      setOrderCount(validOrders.length);

      setTotalSpent(
        validOrders.reduce(
          (sum, order) => sum + Number(order.total || 0),
          0
        )
      );

      const profile = JSON.parse(
        localStorage.getItem("govimartProfile") || "null"
      );

      if (profile?.name) {
        setConsumerName(profile.name);
      } else {
        setConsumerName("Consumer");
      }
    } catch (error) {
      console.error("Unable to load dashboard information:", error);
      setCartCount(0);
      setOrderCount(0);
      setTotalSpent(0);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const result = await getAllProducts();

        if (mounted) {
          setProducts(
            Array.isArray(result.products) ? result.products : []
          );
        }
      } catch (error) {
        console.error("Unable to load products:", error);

        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    refreshDashboard();
    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [location.pathname]);

  useEffect(() => {
    const handleCartUpdate = () => refreshDashboard();

    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener(
      "govimart-profile-updated",
      handleCartUpdate
    );

    return () => {
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener(
        "govimart-profile-updated",
        handleCartUpdate
      );
    };
  }, []);

  const firstName = consumerName.trim().split(/\s+/)[0] || "Consumer";

  return (
    <div className="consumer-dashboard">
     
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
    <button
      type="button"
      className="consumer-sidebar-link active"
      onClick={() => navigate("/consumer")}
    >
      <span className="consumer-nav-icon">▦</span>
      <span>Dashboard</span>
    </button>

    <button
      type="button"
      className="consumer-sidebar-link"
      onClick={() => navigate("/consumer/products")}
    >
      <span className="consumer-nav-icon">▣</span>
      <span>Browse Products</span>
    </button>

    <button
      type="button"
      className="consumer-sidebar-link"
      onClick={() => navigate("/consumer/cart")}
    >
      <span className="consumer-nav-icon">🛒</span>
      <span>My Cart</span>
      {cartCount > 0 && (
        <span className="consumer-sidebar-badge">{cartCount}</span>
      )}
    </button>

    <button
      type="button"
      className="consumer-sidebar-link"
      onClick={() => navigate("/consumer/orders")}
    >
      <span className="consumer-nav-icon">▤</span>
      <span>My Orders</span>
    </button>

    <button
      type="button"
      className="consumer-sidebar-link"
      onClick={() => navigate("/consumer/profile")}
    >
      <span className="consumer-nav-icon">◎</span>
      <span>My Profile</span>
    </button>
  </nav>

  <div className="consumer-sidebar-image">
    <img
      src="/govimart-consumer-sidebar.png"
      alt="Woman shopping for fresh farm produce"
    />
  </div>
</aside>

      <main className="consumer-dashboard-main">
       
        <header className="consumer-dashboard-header">
          <div>
            <p className="consumer-eyebrow">CONSUMER PORTAL</p>
            <h1>Dashboard</h1>
          </div>

          <div className="consumer-dashboard-user">
            <div className="consumer-user-avatar">
              {consumerName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{consumerName}</strong>
              <p>GoviMart Consumer</p>
            </div>
          </div>
        </header>

        <section className="consumer-dashboard-hero">
          <div className="consumer-dashboard-hero-content">
            <p className="consumer-eyebrow">
              WELCOME TO GOVIMART
            </p>

            <h2>
              Fresh choices, straight from local farms.
            </h2>

            <p>
              Discover fresh vegetables, delicious fruits, and
              quality farm products directly from local farmers.
            </p>

            <button
              type="button"
              className="consumer-dashboard-primary"
              onClick={() => navigate("/consumer/products")}
            >
              Browse Products →
            </button>
          </div>

          <div className="consumer-dashboard-hero-art">
            <img
              src="/govimart-consumer.png"
              alt="Farmer offering fresh farm products"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

          </div>
        </section>

        <section className="consumer-dashboard-lower">
          <div className="consumer-dashboard-section">
            <div className="consumer-quick-actions">
              <button
                type="button"
                className="consumer-action-card"
                onClick={() => navigate("/consumer/products")}
              >
                <span className="consumer-action-icon">🔎</span>
                <strong>Browse Products</strong>
                <span>
                  Discover fresh farm produce.
                </span>
                <b>Explore →</b>
              </button>

              <button
                type="button"
                className="consumer-action-card"
                onClick={() => navigate("/consumer/cart")}
              >
                <span className="consumer-action-icon">🛒</span>
                <strong>Shopping Cart</strong>
                <span>
                  Review your selected products.
                </span>
                <b>View Cart →</b>
              </button>

              <button
                type="button"
                className="consumer-action-card"
                onClick={() => navigate("/consumer/orders")}
              >
                <span className="consumer-action-icon">📦</span>
                <strong>Track Orders</strong>
                <span>
                  Check your order information.
                </span>
                <b>My Orders →</b>
              </button>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}

export default ConsumerHome;
