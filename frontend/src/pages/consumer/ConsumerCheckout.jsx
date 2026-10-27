
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../services/orderService";
import "./Consumer.css";

function ConsumerCheckout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "Cash on Delivery",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("govimartCart") || "[]"
      );

      setCart(Array.isArray(savedCart) ? savedCart : []);
    } catch {
      setCart([]);
      setSubmitError("Unable to read your cart. Please add products again.");
    }
  }, []);

  // Calculate subtotal and delivery fee
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  const deliveryFee = subtotal > 0 ? 250 : 0;
  const total = subtotal + deliveryFee;

  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  // Validate delivery details
  const validateForm = () => {
    const newErrors = {};

    if (form.fullName.trim().length < 2) {
      newErrors.fullName = "Enter your full name.";
    }

    if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    if (!form.address.trim()) {
      newErrors.address = "Enter your delivery address.";
    }

    if (!form.city.trim()) {
      newErrors.city = "Enter your city.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit order to the backend API
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setSubmitError("");

    if (cart.length === 0) {
      setSubmitError(
        "Your cart is empty. Please add products before checkout."
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        customer: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
        },

        deliveryAddress: {
          address: form.address.trim(),
          city: form.city.trim(),
        },

        items: cart.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),

        paymentMethod: form.paymentMethod,
      };

      const result = await createOrder(orderData);

      if (!result?.order) {
        throw new Error("The server did not return the created order.");
      }

      // Clear the cart only after the backend confirms success
      localStorage.removeItem("govimartCart");

      navigate("/consumer/order-success", {
        replace: true,
        state: {
          order: result.order,
        },
      });
    } catch (error) {
      console.error("Order submission failed:", error);

      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="consumer-page">
      {/* Navigation */}
      <header className="consumer-navbar">
        <h2
          className="consumer-brand"
          onClick={() => navigate("/consumer")}
          style={{ cursor: "pointer" }}
        >
          🌿 GoviMart
        </h2>

        <nav>
          <button
            type="button"
            onClick={() => navigate("/consumer")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/consumer/products")}
          >
            Products
          </button>

          <button
            type="button"
            onClick={() => navigate("/consumer/cart")}
          >
            Cart ({totalItems})
          </button>
        </nav>
      </header>

      {/* Checkout content */}
      <main className="consumer-checkout-page">
        <h1>Checkout</h1>
        <p>Enter your details to arrange your delivery.</p>

        <form
          className="consumer-checkout-layout"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Delivery information */}
          <section className="consumer-checkout-form">
            <h2>Delivery Information</h2>

            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              aria-invalid={Boolean(errors.fullName)}
            />

            {errors.fullName && (
              <p className="consumer-field-error" role="alert">
                {errors.fullName}
              </p>
            )}

            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={handleChange}
              placeholder="07XXXXXXXX"
              aria-invalid={Boolean(errors.phone)}
            />

            {errors.phone && (
              <p className="consumer-field-error" role="alert">
                {errors.phone}
              </p>
            )}

            <label htmlFor="address">Delivery Address</label>
            <textarea
              id="address"
              name="address"
              autoComplete="street-address"
              value={form.address}
              onChange={handleChange}
              placeholder="House number, street, and area"
              rows={3}
              aria-invalid={Boolean(errors.address)}
            />

            {errors.address && (
              <p className="consumer-field-error" role="alert">
                {errors.address}
              </p>
            )}

            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              value={form.city}
              onChange={handleChange}
              placeholder="Enter your city"
              aria-invalid={Boolean(errors.city)}
            />

            {errors.city && (
              <p className="consumer-field-error" role="alert">
                {errors.city}
              </p>
            )}

            {/* Payment method */}
            <h2 className="consumer-payment-heading">
              Payment Method
            </h2>

            <label className="consumer-payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="Cash on Delivery"
                checked={form.paymentMethod === "Cash on Delivery"}
                onChange={handleChange}
              />

              <span>
                <strong>Cash on Delivery</strong>
                <small>Pay when your order arrives.</small>
              </span>
            </label>

            <label className="consumer-payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="Bank Transfer"
                checked={form.paymentMethod === "Bank Transfer"}
                onChange={handleChange}
              />

              <span>
                <strong>Bank Transfer</strong>
                <small>
                  Payment instructions will be provided separately.
                </small>
              </span>
            </label>

            <button
              type="button"
              className="consumer-continue-button"
              onClick={() => navigate("/consumer/cart")}
              disabled={submitting}
            >
              Back to Cart
            </button>
          </section>

          {/* Order summary */}
          <aside className="consumer-checkout-summary">
            <h2>Order Summary</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              cart.map((item) => (
                <div
                  className="consumer-checkout-item"
                  key={item.productId}
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <strong>
                    Rs.{" "}
                    {(
                      Number(item.price) * Number(item.quantity)
                    ).toFixed(2)}
                  </strong>
                </div>
              ))
            )}

            <div className="consumer-summary-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>

            <div className="consumer-summary-row">
              <span>Delivery fee</span>
              <span>Rs. {deliveryFee.toFixed(2)}</span>
            </div>

            <div className="consumer-checkout-total">
              <span>Total</span>
              <strong>Rs. {total.toFixed(2)}</strong>
            </div>

            {submitError && (
              <p className="consumer-field-error" role="alert">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              className="consumer-primary-button consumer-checkout-button"
              disabled={cart.length === 0 || submitting}
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>

            <p className="consumer-cart-note">
              Your order will be marked as pending until it is processed.
            </p>
          </aside>
        </form>
      </main>
    </div>
  );
}

export default ConsumerCheckout;
