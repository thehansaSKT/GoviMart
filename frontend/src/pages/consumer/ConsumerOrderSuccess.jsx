import { useLocation, useNavigate } from "react-router-dom";
import ConsumerSidebar from "../../components/consumer/ConsumerSidebar";
import "./Consumer.css";

function ConsumerOrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  const formatPrice = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="consumer-dashboard">
      <ConsumerSidebar />

      <main className="consumer-dashboard-main">
        <section className="consumer-order-success">
          <div className="consumer-order-success-icon">✓</div>

          <h1>Order Placed Successfully!</h1>

          <p>
            Thank you for shopping with GoviMart. Your order has been
            received.
          </p>

          {order ? (
            <div className="consumer-order-success-details">
              <div>
                <span>Order Number</span>
                <strong>{order.orderNumber}</strong>
              </div>

              <div>
                <span>Order Status</span>
                <strong>{order.status || "Pending"}</strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>{order.paymentMethod}</strong>
              </div>

              <div>
                <span>Total Amount</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
            </div>
          ) : (
            <p>
              You can check your order details in the My Orders section.
            </p>
          )}

          <div className="consumer-order-success-actions">
            <button
              type="button"
              className="consumer-cart-primary-button"
              onClick={() => navigate("/consumer/orders")}
            >
              View My Orders
            </button>

            <button
              type="button"
              className="consumer-checkout-back"
              onClick={() => navigate("/consumer/products")}
            >
              Continue Shopping
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ConsumerOrderSuccess;
