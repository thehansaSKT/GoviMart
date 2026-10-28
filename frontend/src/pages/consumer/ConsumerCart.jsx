import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConsumerSidebar from "../../components/consumer/ConsumerSidebar";
import "./Consumer.css";

const getUserCartKey = () => {
  try {
    const user = JSON.parse(
      sessionStorage.getItem("goviUser") || "null"
    );

    if (!user?._id) return null;

    return `govimartCart_${user._id}`;
  } catch {
    return null;
  }
};


const normalizeCart = (items) => {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => ({
    ...item,
    productId: String(item.productId || item._id || ""),
    cartItemId:
      item.cartItemId ||
      `${item.productId || item._id || "item"}-${index}-${item.price ?? 0}`,
    quantity: Math.max(0, Number(item.quantity) || 0),
    price: Math.max(0, Number(item.price) || 0),
  })).filter((item) => item.quantity > 0);
};

function ConsumerCart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("goviToken");
    const cartKey = getUserCartKey();

    if (!token || !cartKey) {
      setCart([]);
      setMessage("Please log in to view your personal cart.");
      return;
    }

    try {
      const savedCart = JSON.parse(
        localStorage.getItem(cartKey) || "[]"
      );

      const normalizedCart = normalizeCart(savedCart);

      setCart(normalizedCart);

      localStorage.setItem(
        cartKey,
        JSON.stringify(normalizedCart)
      );
    } catch {
      setCart([]);
      setMessage("Unable to load your cart. Please try again.");
    }
  }, []);

  const saveCart = (updatedCart) => {
    const token = sessionStorage.getItem("goviToken");
    const cartKey = getUserCartKey();

    if (!token || !cartKey) {
      setMessage("Please log in to manage your cart.");
      return;
    }

    const normalizedCart = normalizeCart(updatedCart);


    setCart(normalizedCart);

    localStorage.setItem(
      cartKey,
      JSON.stringify(normalizedCart)
    );

    window.dispatchEvent(new Event("govimart-cart-updated"));
  };

  const itemCount = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const increaseQuantity = (cartItemId) => {
    const updatedCart = cart.map((item) =>
      item.cartItemId === cartItemId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    saveCart(updatedCart);
    setMessage("");
  };

  const decreaseQuantity = (cartItemId) => {
    const updatedCart = cart
      .map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);
    setMessage("");
  };

  const removeItem = (cartItemId) => {
    const updatedCart = cart.filter(
      (item) => item.cartItemId !== cartItemId
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
                  key={item.cartItemId}
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
                      onClick={() => removeItem(item.cartItemId)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="consumer-cart-item-actions">
                    <div className="consumer-cart-quantity">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => decreaseQuantity(item.cartItemId)}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => increaseQuantity(item.cartItemId)}
                      >
                        +
                      </button>
                    </div>

                    <strong className="consumer-cart-line-total">
                      {formatPrice(item.price * item.quantity)}
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
