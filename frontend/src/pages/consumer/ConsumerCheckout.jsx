import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../services/orderService";
import ConsumerSidebar from "../../components/consumer/ConsumerSidebar";
import "./Consumer.css";

const districts = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

function ConsumerCheckout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    district: "",
    city: "",
    paymentMethod: "Cash on Delivery",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("govimartCart") || "[]"
      );

      setCart(Array.isArray(savedCart) ? savedCart : []);

      const profile = JSON.parse(
        localStorage.getItem("govimartProfile") || "{}"
      );

      setFormData((previous) => ({
        ...previous,
        name: profile.name || previous.name,
        phone: profile.phone || previous.phone,
        address: profile.address || previous.address,
      }));
    } catch (error) {
      console.error("Unable to load checkout information:", error);
      setCart([]);
      setErrorMessage(
        "Unable to load your cart. Please refresh and try again."
      );
    }
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const deliveryFee = cart.length > 0 ? 250 : 0;
  const total = subtotal + deliveryFee;

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setErrorMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Enter your full name.";
    }

    if (!/^0\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    if (formData.address.trim().length < 5) {
      newErrors.address = "Enter your complete delivery address.";
    }

    if (!formData.district) {
      newErrors.district = "Please select your district.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Enter your city or town.";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Select a payment method.";
    }

    setErrors(newErrors);

    if (cart.length === 0) {
      setErrorMessage(
        "Your cart is empty. Add products before checkout."
      );
      return false;
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const orderData = {
        customer: {
          fullName: formData.name.trim(),
          phone: formData.phone.trim(),
        },
        deliveryAddress: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          district: formData.district,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),
        paymentMethod: formData.paymentMethod,
      };

      const result = await createOrder(orderData);
      const order = result.order || result;

      localStorage.removeItem("govimartCart");
      window.dispatchEvent(new Event("govimart-cart-updated"));

      navigate("/consumer/order-success", {
        replace: true,
        state: { order },
      });
    } catch (error) {
      console.error(
        "Order submission failed:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to place your order. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="consumer-dashboard">
      <ConsumerSidebar />

      <main className="consumer-dashboard-main consumer-checkout-main">
        <header className="consumer-dashboard-header">
          <div>
            <p className="consumer-eyebrow">CONSUMER PORTAL</p>
            <h1>Checkout</h1>
            <p>Provide your delivery details to place your order.</p>
          </div>
        </header>

        <button
          type="button"
          className="consumer-checkout-back"
          onClick={() => navigate("/consumer/cart")}
        >
          ← Back to Cart
        </button>

        {errorMessage && (
          <div className="consumer-checkout-error" role="alert">
            {errorMessage}
          </div>
        )}

        {cart.length === 0 ? (
          <section className="consumer-cart-empty">
            <div className="consumer-cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>
              Add products to your cart before proceeding to checkout.
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
          <form
            className="consumer-checkout-layout"
            onSubmit={handleSubmit}
          >
            <section className="consumer-checkout-form-panel">
              <div className="consumer-checkout-section-heading">
                <span>01</span>
                <div>
                  <h2>Customer Information</h2>
                  <p>Who should receive this order?</p>
                </div>
              </div>

              <div className="consumer-checkout-fields">
                <div className="consumer-checkout-field">
                  <label htmlFor="checkout-name">Full Name *</label>
                  <input
                    id="checkout-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={updateField}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.name && (
                    <small className="consumer-checkout-field-error">
                      {errors.name}
                    </small>
                  )}
                </div>

                <div className="consumer-checkout-field">
                  <label htmlFor="checkout-phone">Phone Number *</label>
                  <input
                    id="checkout-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={updateField}
                    placeholder="07XXXXXXXX"
                    maxLength={10}
                    required
                  />
                  {errors.phone && (
                    <small className="consumer-checkout-field-error">
                      {errors.phone}
                    </small>
                  )}
                </div>
              </div>

              <div className="consumer-checkout-section-heading">
                <span>02</span>
                <div>
                  <h2>Delivery Address</h2>
                  <p>Where should we deliver your products?</p>
                </div>
              </div>

              <div className="consumer-checkout-fields">
                <div className="consumer-checkout-field full-width">
                  <label htmlFor="checkout-address">
                    House No. / Street Address *
                  </label>
                  <textarea
                    id="checkout-address"
                    name="address"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={updateField}
                    placeholder="House number, street and village"
                    rows={3}
                    required
                  />
                  {errors.address && (
                    <small className="consumer-checkout-field-error">
                      {errors.address}
                    </small>
                  )}
                </div>

                <div className="consumer-checkout-field">
                  <label htmlFor="checkout-district">District *</label>
                  <select
                    id="checkout-district"
                    name="district"
                    value={formData.district}
                    onChange={updateField}
                    required
                  >
                    <option value="">Select district</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <small className="consumer-checkout-field-error">
                      {errors.district}
                    </small>
                  )}
                </div>

                <div className="consumer-checkout-field">
                  <label htmlFor="checkout-city">City / Town *</label>
                  <input
                    id="checkout-city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={updateField}
                    placeholder="Enter your city or town"
                    required
                  />
                  {errors.city && (
                    <small className="consumer-checkout-field-error">
                      {errors.city}
                    </small>
                  )}
                </div>
              </div>

              <div className="consumer-checkout-section-heading">
                <span>03</span>
                <div>
                  <h2>Payment Method</h2>
                  <p>Select how you want to pay.</p>
                </div>
              </div>

              <div className="consumer-checkout-payment-options">
                <label
                  className={`consumer-checkout-payment-option ${
                    formData.paymentMethod === "Cash on Delivery"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={
                      formData.paymentMethod === "Cash on Delivery"
                    }
                    onChange={updateField}
                  />
                  <span className="consumer-checkout-payment-icon">
                    💵
                  </span>
                  <span>
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order arrives</small>
                  </span>
                </label>

                
              </div>
            </section>

            <aside className="consumer-checkout-summary">
              <h2>Your Order</h2>
              <p className="consumer-checkout-summary-subtitle">
                Review your selected products.
              </p>

              <div className="consumer-checkout-order-items">
                {cart.map((item, index) => (
                  <div
                    className="consumer-checkout-order-item"
                    key={item.productId || index}
                  >
                    <div className="consumer-checkout-order-info">
                      <strong>{item.name}</strong>
                      <small>
                        Qty: {item.quantity} {item.unit || "kg"}
                      </small>
                    </div>

                    <strong className="consumer-checkout-item-price">
                      {formatPrice(
                        Number(item.price) * Number(item.quantity)
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="consumer-checkout-total-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="consumer-checkout-total-row">
                <span>Delivery Fee</span>
                <strong>{formatPrice(deliveryFee)}</strong>
              </div>

              <div className="consumer-checkout-grand-total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              <button
                type="submit"
                className="consumer-checkout-place-order"
                disabled={submitting || cart.length === 0}
              >
                {submitting
                  ? "Placing Order..."
                  : `Place Order · ${formatPrice(total)}`}
              </button>

              <p className="consumer-checkout-disclaimer">
                By placing your order, you confirm that your delivery
                details are correct.
              </p>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}

export default ConsumerCheckout;
