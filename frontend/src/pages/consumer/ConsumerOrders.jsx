import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConsumerSidebar from "../../components/consumer/ConsumerSidebar";
import { getAllOrders } from "../../services/orderService";
import "./Consumer.css";

function ConsumerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("goviToken");
        const storedUser = sessionStorage.getItem("goviUser");
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (!token || !user?._id) {
          navigate("/login/consumer", { replace: true });
          return;
        }

        if (user.role !== "consumer") {
          setError("This page is available to consumer accounts only.");
          return;
        }

        const result = await getAllOrders();

        if (!cancelled) {
          setOrders(Array.isArray(result.orders) ? result.orders : []);
        }
      } catch (err) {
        console.error(
          "Unable to fetch orders:",
          err.response?.data || err.message
        );

        if (!cancelled) {
          if (err.response?.status === 401) {
            localStorage.removeItem("goviToken");
            localStorage.removeItem("goviUser");
            navigate("/login/consumer", { replace: true });
            return;
          }

          setError(
            err.response?.data?.message ||
              "Unable to load orders. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const formatPrice = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getStatusClass = (status) =>
    `consumer-order-status consumer-order-status-${String(
      status || "Pending"
    )
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/\s+/g, "-")
      .toLowerCase()}`;

  return (
    <div className="consumer-dashboard">
      <ConsumerSidebar />

      <main className="consumer-dashboard-main">
        <header className="consumer-dashboard-header">
          <div>
            <p className="consumer-eyebrow">CONSUMER PORTAL</p>
            <h1>My Orders</h1>
            <p>View your order history and track order status.</p>
          </div>
        </header>

        {loading ? (
          <section className="consumer-orders-message">
            <p>Loading your orders...</p>
          </section>
        ) : error ? (
          <section className="consumer-orders-message">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </section>
        ) : orders.length === 0 ? (
          <section className="consumer-orders-empty">
            <div className="consumer-cart-empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Your orders will appear here after checkout.</p>
            <button
              type="button"
              className="consumer-cart-primary-button"
              onClick={() => navigate("/consumer/products")}
            >
              Browse Products
            </button>
          </section>
        ) : (
          <section className="consumer-orders-list">
            <div className="consumer-orders-heading">
              <h2>Order History</h2>
              <span>
                {orders.length}{" "}
                {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>

            {orders.map((order) => (
              <article
                className="consumer-order-card"
                key={order._id}
              >
                <div className="consumer-order-card-header">
                  <div>
                    <p className="consumer-order-label">Order Number</p>
                    <h3>{order.orderNumber}</h3>
                    <p className="consumer-order-date">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span className={getStatusClass(order.status)}>
                    {order.status || "Pending"}
                  </span>
                </div>

                <div className="consumer-order-products">
                  {order.items?.map((item, index) => (
                    <div
                      className="consumer-order-product"
                      key={item.productId || index}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <p>
                          Qty: {item.quantity} {item.unit || "kg"}
                        </p>
                        <p>
                          {formatPrice(item.price)} per{" "}
                          {item.unit || "kg"}
                        </p>
                      </div>

                      <strong>
                        {formatPrice(
                          Number(item.price) * Number(item.quantity)
                        )}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="consumer-order-details">
                  <div>
                    <span>Delivery Address</span>
                    <strong>
                      {order.deliveryAddress?.address}
                      {order.deliveryAddress?.city
                        ? `, ${order.deliveryAddress.city}`
                        : ""}
                      {order.deliveryAddress?.district
                        ? `, ${order.deliveryAddress.district}`
                        : ""}
                    </strong>
                  </div>

                  <div>
                    <span>Payment Method</span>
                    <strong>{order.paymentMethod}</strong>
                  </div>
                </div>

                <div className="consumer-order-totals">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatPrice(order.subtotal)}</strong>
                  </div>

                  <div>
                    <span>Delivery Fee</span>
                    <strong>{formatPrice(order.deliveryFee)}</strong>
                  </div>

                  <div className="consumer-order-total">
                    <span>Total</span>
                    <strong>{formatPrice(order.total)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default ConsumerOrders;