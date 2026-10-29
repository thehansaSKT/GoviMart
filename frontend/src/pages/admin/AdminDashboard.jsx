import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import "./Admin.css";

const API_URL = "http://localhost:5000/api/orders";

const STATUSES = [
  "Pending",
  "Accepted",
  "Processing",
  "OutForDelivery",
  "Delivered",
  "Cancelled",
];

function formatStatus(status = "") {
  return status === "OutForDelivery"
    ? "Out for Delivery"
    : status;
}

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getOrderNumber(order) {
  return order?.orderNumber || order?._id || "N/A";
}

function getCustomerName(order) {
  return (
    order?.customer?.fullName ||
    order?.customer?.name ||
    order?.customerName ||
    order?.userId?.name ||
    "Not available"
  );
}

function getCustomerPhone(order) {
  return (
    order?.customer?.phone ||
    order?.customerPhone ||
    order?.phone ||
    order?.userId?.phone ||
    "Not available"
  );
}

function getDeliveryAddress(order) {
  const address = order?.deliveryAddress;

  if (typeof address === "string") {
    return address || "Not available";
  }

  if (address && typeof address === "object") {
    const parts = [
      address.address,
      address.city,
      address.district,
    ].filter(Boolean);

    if (parts.length) return parts.join(", ");
  }

  return (
    order?.customer?.address ||
    order?.userId?.address ||
    order?.address ||
    "Not available"
  );
}

function getDistrict(order) {
  const address = order?.deliveryAddress;

  return (
    order?.district ||
    (typeof address === "object" ? address?.district : "") ||
    order?.customer?.district ||
    order?.userId?.district ||
    "Not available"
  );
}

function getProductName(item) {
  return (
    item?.productName ||
    item?.name ||
    item?.product?.name ||
    item?.productId?.name ||
    "Product"
  );
}

function getItemPrice(item) {
  return Number(
    item?.price ??
      item?.unitPrice ??
      item?.product?.price ??
      item?.productId?.price ??
      0
  );
}

function getItemSubtotal(item) {
  const quantity = Number(item?.quantity || 0);

  return Number(
    item?.subtotal ?? quantity * getItemPrice(item)
  );
}


function getFarmerDetails(item) {
  const farmer =
    item?.farmer ||
    item?.farmerId ||
    item?.product?.farmerId ||
    item?.productId?.farmerId ||
    {};

  return {
    name: farmer.name || farmer.fullName || item?.farmerName || "Not available",
    farmName: farmer.farmName || item?.farmerName || "Not available",
    phone: farmer.phone || "Not available",
    district:
      farmer.district ||
      item?.product?.district ||
      item?.productId?.district ||
      item?.district ||
      "Not available",
    address: farmer.address || "Not available",
  };
}


export default function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchOrders = useCallback(
    async (showRefresh = false) => {
      const token = sessionStorage.getItem("goviToken");

      let user = null;

      try {
        user = JSON.parse(
          sessionStorage.getItem("goviUser") || "null"
        );
      } catch {
        user = null;
      }

      if (
        !token ||
        user?.role?.toLowerCase() !== "admin"
      ) {
        navigate("/admin/login", { replace: true });
        return;
      }

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          logoutUser();
          navigate("/admin/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load orders."
          );
        }

        setOrders(
          Array.isArray(data.orders) ? data.orders : []
        );
      } catch (err) {
        setError(
          err.message ||
            "Could not connect to the GoviMart backend."
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

  const viewOrderDetails = async (orderId) => {
    const token = sessionStorage.getItem("goviToken");

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    setDetailsLoading(true);
    setSelectedOrder(null);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logoutUser();
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load order details."
        );
      }

      const detailedOrder = data.order || data;
      setSelectedOrder(detailedOrder);
    } catch (err) {
      setError(
        err.message || "Unable to load order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateStatus = async (order, newStatus) => {
    const token = sessionStorage.getItem("goviToken");

    if (!token || !STATUSES.includes(newStatus)) {
      setError("Invalid session or order status.");
      return;
    }

    if (order.status === newStatus) return;

    setUpdatingId(order._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/${order._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logoutUser();
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update order status."
        );
      }

      const updatedOrder = {
        ...order,
        ...(data.order || {}),
        status: data.order?.status || newStatus,
      };

      setOrders((current) =>
        current.map((item) =>
          item._id === order._id ? updatedOrder : item
        )
      );

      setSelectedOrder((current) =>
        current?._id === order._id
          ? { ...current, ...updatedOrder }
          : current
      );

      setSuccess(
        `Order ${getOrderNumber(order)} updated to ${formatStatus(
          updatedOrder.status
        )}.`
      );
    } catch (err) {
      setError(err.message || "Failed to update order.");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const totalSales = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0
    );

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => order.status === filter);

  const handleLogout = () => {
    logoutUser();
    navigate("/admin/login", { replace: true });
  };

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div>
          <p className="admin-eyebrow">
            GOVIMART MANAGEMENT
          </p>
          <h1>Admin Dashboard</h1>
          <p className="admin-dashboard-subtitle">
            Manage marketplace orders and monitor activity.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => fetchOrders(true)}
            disabled={loading || refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </header>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-success" role="status">
          {success}
        </div>
      )}

      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span>Total Orders</span>
          <strong>{loading ? "—" : orders.length}</strong>
          <small>All marketplace orders</small>
        </article>

        <article className="admin-stat-card">
          <span>Pending Orders</span>
          <strong>{loading ? "—" : pendingCount}</strong>
          <small>Awaiting a decision</small>
        </article>

        <article className="admin-stat-card">
          <span>Delivered Orders</span>
          <strong>{loading ? "—" : completedCount}</strong>
          <small>Successfully delivered</small>
        </article>

        <article className="admin-stat-card">
          <span>Order Value</span>
          <strong>{loading ? "—" : formatMoney(totalSales)}</strong>
          <small>Excludes cancelled orders</small>
        </article>
      </section>

      <section className="admin-orders-section">
        <div className="admin-orders-heading">
          <div>
            <h2>Order Management</h2>
            <p>
              View order details, delivery information, and farmers.
            </p>
          </div>

          <select
            aria-label="Filter orders by status"
            className="admin-status-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="All">All Orders</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="admin-empty-state">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty-state">
            <span className="admin-empty-icon">📦</span>
            <h3>
              {orders.length === 0
                ? "No orders yet"
                : "No matching orders"}
            </h3>
            <p>
              {orders.length === 0
                ? "Orders will appear when consumers place orders."
                : "Try selecting another status."}
            </p>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => fetchOrders(true)}
            >
              Check Again
            </button>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Manage</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>
                        #{String(getOrderNumber(order)).slice(-10)}
                      </strong>
                    </td>

                    <td>{getCustomerName(order)}</td>

                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            "en-LK"
                          )
                        : "—"}
                    </td>

                    <td>{formatMoney(order.total)}</td>

                    <td>{order.paymentMethod || "—"}</td>

                    <td>
                      <span
                        className={`admin-status-badge admin-status-${(
                          order.status || "Pending"
                        )
                          .toLowerCase()
                          .replace(/[^a-z]/g, "")}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-view-details-button"
                        onClick={() => viewOrderDetails(order._id)}
                      >
                        View Details
                      </button>
                    </td>

                    <td>
                      <select
                        aria-label={`Update order ${getOrderNumber(order)}`}
                        className="admin-order-action"
                        value={order.status || "Pending"}
                        disabled={updatingId === order._id}
                        onChange={(event) =>
                          updateStatus(order, event.target.value)
                        }
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {formatStatus(status)}
                          </option>
                        ))}
                      </select>

                      {updatingId === order._id && (
                        <small className="admin-updating-text">
                          Saving...
                        </small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {detailsLoading && (
        <div className="admin-modal-backdrop">
          <div className="admin-details-modal">
            Loading order details...
          </div>
        </div>
      )}

      {selectedOrder && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedOrder(null)}
        >
          <section
            className="admin-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <p className="admin-eyebrow">GOVIMART ORDER</p>
                <h2 id="order-details-title">
                  Order #{getOrderNumber(selectedOrder)}
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className="admin-details-grid">
              <div>
                <span>Customer</span>
                <strong>{getCustomerName(selectedOrder)}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{getCustomerPhone(selectedOrder)}</strong>
              </div>

              <div>
                <span>Order Date</span>
                <strong>
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString(
                        "en-LK"
                      )
                    : "Not available"}
                </strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>
                  {selectedOrder.paymentMethod || "Not available"}
                </strong>
              </div>

              <div>
                <span>Delivery Address</span>
                <strong>{getDeliveryAddress(selectedOrder)}</strong>
              </div>

              <div>
                <span>Delivery District</span>
                <strong>{getDistrict(selectedOrder)}</strong>
              </div>

              <div>
                <span>Order Status</span>
                <strong>{formatStatus(selectedOrder.status)}</strong>
              </div>
            </div>

            <h3 className="admin-details-section-title">
              Ordered Products
            </h3>

            {Array.isArray(selectedOrder.items) &&
            selectedOrder.items.length > 0 ? (
              <div className="admin-details-items">
                {selectedOrder.items.map((item, index) => (
                  <div
                    className="admin-details-item"
                    key={item._id || index}
                  >
                    <div>
                      <strong>{getProductName(item)}</strong>
                      <span>
                        Quantity: {Number(item.quantity || 0)} ×{" "}
                        {formatMoney(getItemPrice(item))}
                      </span>
                    </div>
                    <strong>
                      {formatMoney(getItemSubtotal(item))}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p>No product details available.</p>
            )}

            <h3 className="admin-details-section-title">
              Farmer Details
            </h3>

            {Array.isArray(selectedOrder.items) &&
            selectedOrder.items.length > 0 ? (
              <div className="admin-details-items">
                {selectedOrder.items.map((item, index) => {
                  const farmer = getFarmerDetails(item);

                  return (
                    <div
                      className="admin-farmer-card"
                      key={item._id || index}
                    >
                      <div className="admin-farmer-card-header">
                       
                        <div>
                          <strong>{getProductName(item)}</strong>
                          <span>Supplier information</span>
                        </div>
                      </div>

                      <div className="admin-farmer-fields">
                        <div>
                          <span>Farmer Name</span>
                          <strong>{farmer.name}</strong>
                        </div>

                        <div>
                          <span>Farm Name</span>
                          <strong>{farmer.farmName}</strong>
                        </div>

                        <div>
                          <span>Phone</span>
                          <strong>{farmer.phone}</strong>
                        </div>

                        <div>
                          <span>Farmer District</span>
                          <strong>{farmer.district}</strong>
                        </div>

                        <div className="admin-farmer-address">
                          <span>Farm Address</span>
                          <strong>{farmer.address}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No farmer information is available.</p>
            )}

            <div className="admin-details-totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatMoney(selectedOrder.subtotal)}</strong>
              </div>

              <div>
                <span>Delivery Fee</span>
                <strong>{formatMoney(selectedOrder.deliveryFee)}</strong>
              </div>

              <div className="admin-details-grand-total">
                <span>Total</span>
                <strong>{formatMoney(selectedOrder.total)}</strong>
              </div>
            </div>

            <button
              type="button"
              className="admin-modal-done"
              onClick={() => setSelectedOrder(null)}
            >
              Close Details
            </button>
          </section>
        </div>
      )}

    </main>
  );
}
