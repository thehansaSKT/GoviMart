import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../services/productService";
import { getAllOrders } from "../../services/orderService";
import { getCart } from "../../services/cartService";
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

  const refreshDashboard = useCallback(async () => {
    try {
      const user = JSON.parse(
        sessionStorage.getItem("goviUser") || "null"
      );

      setConsumerName(user?.name || "Consumer");

      const cart = getCart();

      setCartCount(
        Array.isArray(cart)
          ? cart.reduce(
              (sum, item) => sum + Number(item.quantity || 0),
              0
            )
          : 0
      );

      if (!sessionStorage.getItem("goviToken") || user?.role !== "consumer") {
        setOrderCount(0);
        setTotalSpent(0);
        return;
      }

      const result = await getAllOrders();
      const orders = Array.isArray(result.orders) ? result.orders : [];

      setOrderCount(orders.length);

      setTotalSpent(
        orders.reduce(
          (sum, order) => sum + Number(order.total || 0),
          0
        )
      );
    } catch (error) {
      console.error("Unable to refresh dashboard:", error);

      setCartCount(0);
      setOrderCount(0);
      setTotalSpent(0);

      try {
        const user = JSON.parse(
          sessionStorage.getItem("goviUser") || "null"
        );
        setConsumerName(user?.name || "Consumer");
      } catch {
        setConsumerName("Consumer");
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
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

      if (mounted) {
        await refreshDashboard();
      }
    };

    loadDashboard();

    const handleDashboardUpdate = () => {
      refreshDashboard();
    };

    window.addEventListener("storage", handleDashboardUpdate);
    window.addEventListener("govi-profile-updated", handleDashboardUpdate);
    window.addEventListener("govimart-profile-updated", handleDashboardUpdate);
    window.addEventListener("govimart-cart-updated", handleDashboardUpdate);

    return () => {
      mounted = false;
      window.removeEventListener("storage", handleDashboardUpdate);
      window.removeEventListener("govi-profile-updated", handleDashboardUpdate);
      window.removeEventListener("govimart-profile-updated", handleDashboardUpdate);
      window.removeEventListener("govimart-cart-updated", handleDashboardUpdate);
    };
  }, [refreshDashboard]);

  return (
    <div className="consumer-dashboard">
      <ConsumerSidebar />

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
            <p className="consumer-eyebrow">WELCOME TO GOVIMART</p>

            <h2>Fresh choices, straight from local farms.</h2>

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
                onClick={() => navigate("/consumer/products")}
              >
                <span className="consumer-action-icon">🔎</span>
                <strong>Browse Products</strong>
                <span>Discover fresh farm produce.</span>
                <b>Explore →</b>
              </button>

              <button
                type="button"
                className="consumer-action-card"
                onClick={() => navigate("/consumer/cart")}
              >
                <span className="consumer-action-icon">🛒</span>
                <strong>Shopping Cart</strong>
                <span>Review your selected products.</span>
                <b>View Cart →</b>
              </button>

              <button
                type="button"
                className="consumer-action-card"
                onClick={() => navigate("/consumer/orders")}
              >
                <span className="consumer-action-icon">📦</span>
                <strong>Track Orders</strong>
                <span>Check your order information.</span>
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
