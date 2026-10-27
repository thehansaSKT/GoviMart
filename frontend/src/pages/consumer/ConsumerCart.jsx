
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Consumer.css";

function ConsumerCart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

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
    localStorage.setItem("govimartCart", JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId, change) => {
    const updatedCart = cart
      .map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + change }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);
  };

  const removeItem = (productId) => {
    saveCart(cart.filter((item) => item.productId !== productId));
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  return (
    <div className="consumer-page">
      <header className="consumer-navbar">
        <h2
          className="consumer-brand"
          onClick={() => navigate("/consumer")}
          style={{ cursor: "pointer" }}
        >
          🌿 GoviMart
        </h2>

        <nav>
          <button onClick={() => navigate("/consumer")}>
            Home
          </button>

          <button onClick={() => navigate("/consumer/products")}>
            Products
          </button>

          <button
            className="consumer-nav-active"
            onClick={() => navigate("/consumer/cart")}
          >
            Cart ({totalItems})
          </button>
        </nav>
      </header>

      <main className="consumer-cart-page">
        <h1>My Shopping Cart</h1>
        <p>Fresh farm products, ready for your basket.</p>

        {cart.length === 0 ? (
          <section className="consumer-cart-empty">
            <div className="consumer-cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>
              Explore fresh vegetables, fruits, and other
              products from local farmers.
            </p>

            <button
              className="consumer-primary-button"
              onClick={() => navigate("/consumer/products")}
            >
              Explore Products
            </button>
          </section>
        ) : (
          <div className="consumer-cart-layout">
            <section className="consumer-cart-items">
              {cart.map((item) => (
                <article
                  className="consumer-cart-item"
                  key={item.productId}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                    />
                  ) : (
                    <div className="consumer-cart-placeholder">
                      🌱
                    </div>
                  )}

                  <div className="consumer-cart-item-info">
                    <h3>{item.name}</h3>
                    <p>
                      Rs. {Number(item.price).toFixed(2)} /{" "}
                      {item.unit}
                    </p>

                    <div className="consumer-quantity-control">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, -1)
                        }
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(item.productId, 1)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="consumer-cart-item-total">
                    <strong>
                      Rs.{" "}
                      {(
                        Number(item.price) *
                        Number(item.quantity)
                      ).toFixed(2)}
                    </strong>

                    <button
                      className="consumer-remove-button"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="consumer-cart-summary">
              <h2>Order Summary</h2>

              <div className="consumer-summary-row">
                <span>Total items</span>
                <span>{totalItems}</span>
              </div>

              <div className="consumer-summary-row">
                <span>Subtotal</span>
                <strong>Rs. {subtotal.toFixed(2)}</strong>
              </div>

              <p className="consumer-cart-note">
                Delivery charges will be calculated at checkout.
              </p>

              <button
                className="consumer-primary-button consumer-checkout-button"
                onClick={() =>
                  navigate("/consumer/checkout")
                }
              >
                Proceed to Checkout
              </button>

              <button
                className="consumer-continue-button"
                onClick={() => navigate("/consumer/products")}
              >
                Continue Shopping
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default ConsumerCart;
