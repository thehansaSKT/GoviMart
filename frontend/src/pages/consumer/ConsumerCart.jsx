import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConsumerSidebar from "../../components/consumer/ConsumerSidebar";
import "./Consumer.css";

function ConsumerCart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("govimartCart") || "[]"
      );

      setCart(Array.isArray(savedCart) ? savedCart : []);
    } catch {
      setCart([]);
    }
  }, []);

  const saveCart = (updatedCart) => {
    setCart(updatedCart);

    localStorage.setItem(
      "govimartCart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("govimart-cart-updated")
    );
  };

  const itemCount = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const increaseQuantity = (productId) => {
    const updatedCart = cart.map((item) => {
      if (item.productId !== productId) return item;

      return {
        ...item,
        quantity: Number(item.quantity || 0) + 1,
      };
    });

    saveCart(updatedCart);
    setMessage("");
  };

  const decreaseQuantity = (productId) => {
    const updatedCart = cart
      .map((item) => {
        if (item.productId !== productId) return item;

        return {
          ...item,
          quantity: Number(item.quantity || 0) - 1,
        };
      })
      .filter((item) => Number(item.quantity) > 0);

    saveCart(updatedCart);
    setMessage("");
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(
      (item) => item.productId !== productId
    );

    saveCart(updatedCart);
    setMessage("Product removed from your cart.");
  };

  const clearCart = () => {
    saveCart([]);
    setMessage("Your cart has been cleared.");
  };

  const formatPrice = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="consumer-dashboard">
      <ConsumerSidebar />

      <main className="consumer-dashboard-main consumer-cart-main">
        <header className="consumer-dashboard-header">
          <div>
            <p className="consumer-eyebrow">CONSUMER PORTAL</p>
            <h1>My Shopping Cart</h1>
          </div>

          <button
            type="button"
            className="consumer-cart-continue-button"
            onClick={() => navigate("/consumer/products")}
          >
            ← Continue Shopping
          </button>
        </header>

        {message && (
          <div className="consumer-products-message" role="status">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {cart.length === 0 ? (
          <section className="consumer-cart-empty">
            <div className="consumer-cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>
              Discover fresh vegetables, fruits and other products
              directly from local farmers.
            </p>

            <button
              type="button"
              className="consumer-cart-primary-button"
              onClick={() => navigate("/consumer/products")}
            >
              Browse Products
            </button>
          </section>
        ) : (
          <div className="consumer-cart-layout">
            <section className="consumer-cart-items">
              <div className="consumer-cart-section-heading">
                <h2>Cart Items</h2>
                <span>
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              {cart.map((item) => (
                <article
                  className="consumer-cart-item"
                  key={item.productId}
                >
                  <div className="consumer-cart-item-info">
                    <h3>{item.name}</h3>

                    <p className="consumer-cart-item-unit">
                      Price per {item.unit || "kg"}
                    </p>

                    <strong>{formatPrice(item.price)}</strong>

                    <button
                      type="button"
                      className="consumer-cart-remove-button"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="consumer-cart-item-actions">
                    <div className="consumer-cart-quantity">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() =>
                          decreaseQuantity(item.productId)
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() =>
                          increaseQuantity(item.productId)
                        }
                      >
                        +
                      </button>
                    </div>

                    <strong className="consumer-cart-line-total">
                      {formatPrice(
                        Number(item.price) *
                          Number(item.quantity)
                      )}
                    </strong>
                  </div>
                </article>
              ))}

              <div className="consumer-cart-bottom-actions">
                <button
                  type="button"
                  className="consumer-cart-continue-link"
                  onClick={() => navigate("/consumer/products")}
                >
                  ← Add More Products
                </button>

                <button
                  type="button"
                  className="consumer-cart-clear-button"
                  onClick={clearCart}
                >
                  Clear Cart
                </button>
              </div>
            </section>

            <aside className="consumer-cart-summary">
              <h2>Order Summary</h2>

              <div className="consumer-cart-summary-row">
                <span>Items</span>
                <span>{itemCount}</span>
              </div>

              <div className="consumer-cart-summary-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="consumer-cart-summary-row">
                <span>Delivery fee</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="consumer-cart-summary-total">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <p className="consumer-cart-summary-note">
                The final total will include the delivery fee
                shown during checkout.
              </p>

              <button
                type="button"
                className="consumer-cart-primary-button"
                onClick={() => navigate("/consumer/checkout")}
              >
                Proceed to Checkout →
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default ConsumerCart;