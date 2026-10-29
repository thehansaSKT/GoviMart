import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/farmer/Sidebar";
import Header from "../../components/farmer/Header";
import { logoutUser } from "../../services/authService";
import "./Farmer.css";

const API_URL = "http://localhost:5000/api/orders/farmer";

const ORDER_STATUSES = [
  "Accepted",
  "Processing",
  "OutForDelivery",
  "Delivered",
];

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatStatus(status = "") {
  return status === "OutForDelivery" ? "Out for Delivery" : status;
}

function statusClass(status = "") {
  return status.toLowerCase().replace(/[^a-z]/g, "");
}

function getDeliveryAddress(order) {
  const address = order.deliveryAddress;

  if (typeof address === "string") return address;

  if (address && typeof address === "object") {
    return [
      address.address,
      address.city,
      address.district,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return "Not available";
}

export default function FarmerOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(
    async (manualRefresh = false) => {
      const token = sessionStorage.getItem("goviToken");

      let user = null;

      try {
        user = JSON.parse(
          sessionStorage.getItem("goviUser") || "null"
        );
      } catch {
        user = null;
      }

      if (!token || user?.role?.toLowerCase() !== "farmer") {
        navigate("/login/farmer", { replace: true });
        return;
      }

      setError("");

      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          logoutUser();
          navigate("/login/farmer", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load your orders."
          );
        }

        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err) {
        setError(
          err.message || "Unable to connect to the backend."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => order.status === filter);

  const activeCount = orders.filter((order) =>
    ["Accepted", "Processing", "OutForDelivery"].includes(
      order.status
    )
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.farmerSubtotal || 0),
    0
  );

  return (
    <div className="farmer-orders-layout">
      <Sidebar />

      <div className="farmer-orders-content">
        <br></br>
        <Header title="My Orders"/>

        <main className="farmer-orders-page">
          
          {error && (
            <div className="fo-error" role="alert">
              <strong>Unable to load orders</strong>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => fetchOrders(true)}
              >
                Try Again
              </button>
            </div>
          )}

          <section className="fo-stats">
            <article className="fo-stat-card">
              <span>Total Orders</span>
              <strong>{loading ? "—" : orders.length}</strong>
              <small>Accepted orders</small>
            </article>

            <article className="fo-stat-card">
              <span>In Progress</span>
              <strong>{loading ? "—" : activeCount}</strong>
              <small>Being prepared or delivered</small>
            </article>

            <article className="fo-stat-card">
              <span>Delivered</span>
              <strong>{loading ? "—" : deliveredCount}</strong>
              <small>Completed orders</small>
            </article>

            <article className="fo-stat-card">
              <span>Your Item Value</span>
              <strong className="fo-money">
                {loading ? "—" : formatMoney(totalValue)}
              </strong>
              <small>Subtotal of your products</small>
            </article>
          </section>

          <section className="fo-panel">
            <div className="fo-panel-header">
              <div>
                <h2>Orders for Your Products</h2>
                <p className="fo-muted">
                  Orders appear here after the administrator accepts
                  them.
                </p>
              </div>

              <div className="fo-controls">
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  aria-label="Filter orders by status"
                >
                  <option value="All">All Orders</option>

                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => fetchOrders(true)}
                  disabled={loading || refreshing}
                >
                  {refreshing ? "Refreshing..." : "↻ Refresh"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="fo-empty">
                <span>⏳</span>
                <h3>Loading orders...</h3>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="fo-empty">
                <span>📦</span>
                <h3>
                  {orders.length === 0
                    ? "No accepted orders yet"
                    : "No orders match this filter"}
                </h3>
                <p>
                  When an administrator accepts an order containing
                  your products, it will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => fetchOrders(true)}
                >
                  Check for Orders
                </button>
              </div>
            ) : (
              <div className="fo-order-list">
                {filteredOrders.map((order) => (
                  <article
                    className="fo-order-card"
                    key={order._id}
                  >
                    <div className="fo-order-heading">
                      <div>
                        <span className="fo-order-number">
                          ORDER #{order.orderNumber || order._id}
                        </span>

                        <h3>
                          {order.customerName ||
                            order.customer?.fullName ||
                            "Customer"}
                        </h3>

                        <span className="fo-date">
                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleString("en-LK")
                            : "Date unavailable"}
                        </span>
                      </div>

                      <span
                        className={`fo-status fo-status-${statusClass(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <div className="fo-customer-grid">
                      <div>
                        <span>Customer Name</span>
                        <strong>
                          {order.customerName ||
                            order.customer?.fullName ||
                            "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>Phone Number</span>
                        <strong>
                          {order.customerPhone ||
                            order.customer?.phone ||
                            "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>Delivery Address</span>
                        <strong>{getDeliveryAddress(order)}</strong>
                      </div>

                      <div>
                        <span>Delivery District</span>
                        <strong>
                          {order.deliveryAddress?.district ||
                            "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>Payment Method</span>
                        <strong>
                          {order.paymentMethod || "Not available"}
                        </strong>
                      </div>
                    </div>

                    <h4 className="fo-products-heading">
                      Your Products in This Order
                    </h4>

                    <div className="fo-products-list">
                      {(order.items || []).map((item, index) => (
                        <div
                          className="fo-product-row"
                          key={item.productId || index}
                        >
                          <div>
                            <strong>{item.name}</strong>
                            <span>
                              Quantity: {item.quantity}{" "}
                              {item.unit || "unit"}
                            </span>
                            <span>
                              Unit price: {formatMoney(item.price)}
                            </span>
                          </div>

                          <strong>
                            {formatMoney(
                              Number(item.price || 0) *
                                Number(item.quantity || 0)
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className="fo-order-total">
                      <span>Your products subtotal</span>
                      <strong>
                        {formatMoney(order.farmerSubtotal)}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
