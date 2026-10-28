import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../services/productService";
import ConsumerSidebar from "../../components/consumer/ConsumerSidebar";
import "./Consumer.css";

function ConsumerHome() {
  const navigate = useNavigate();

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

      setConsumerName(profile?.name || "Consumer");
    } catch (error) {
      console.error(
        "Unable to load dashboard information:",
        error
      );

      setCartCount(0);
      setOrderCount(0);
      setTotalSpent(0);
      setConsumerName("Consumer");
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const result = await getAllProducts();

        if (mounted) {
          setProducts(
            Array.isArray(result.products)
              ? result.products
              : []
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
  }, []);

  useEffect(() => {
    const handleDashboardUpdate = () => refreshDashboard();

    window.addEventListener("storage", handleDashboardUpdate);
    window.addEventListener(
      "govimart-profile-updated",
      handleDashboardUpdate
    );
    window.addEventListener(
      "govimart-cart-updated",
      handleDashboardUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleDashboardUpdate
      );
      window.removeEventListener(
        "govimart-profile-updated",
        handleDashboardUpdate
      );
      window.removeEventListener(
        "govimart-cart-updated",
        handleDashboardUpdate
      );
    };
  }, []);

  return (
    <div className="consumer-dashboard">
      <ConsumerSidebar />

      <main className="consumer-dashboard-main">
        <header className="consumer-dashboard-header">
          <div>
            <p className="consumer-eyebrow">
              CONSUMER PORTAL
            </p>
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
              onClick={() =>
                navigate("/consumer/products")
              }
            >
              Browse Products →
            </button>
          </div>

          <div className="consumer-dashboard-hero-art">
            <img
              src="/govimart-consumer.png"
              alt="Consumer shopping for fresh farm products"
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
                onClick={() =>
                  navigate("/consumer/products")
                }
              >
                <span className="consumer-action-icon">
                  🔎
                </span>
                <strong>Browse Products</strong>
                <span>
                  Discover fresh farm produce.
                </span>
                <b>Explore →</b>
              </button>

              <button
                type="button"
                className="consumer-action-card"
                onClick={() =>
                  navigate("/consumer/cart")
                }
              >
                <span className="consumer-action-icon">
                  🛒
                </span>
                <strong>Shopping Cart</strong>
                <span>
                  Review your selected products.
                </span>
                <b>View Cart →</b>
              </button>

              <button
                type="button"
                className="consumer-action-card"
                onClick={() =>
                  navigate("/consumer/orders")
                }
              >
                <span className="consumer-action-icon">
                  📦
                </span>
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
