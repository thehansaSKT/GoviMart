import { useEffect, useMemo, useState } from "react";
import { getAllProducts } from "../../services/productService";
import ConsumerSidebar from "../../components/consumer/ConsumerSidebar";
import "./Consumer.css";

const categories = ["All", "Vegetables", "Fruits", "Grains", "Other"];

function ConsumerProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [quantities, setQuantities] = useState({});

  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = () => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("govimartCart") || "[]"
      );

      const validCart = Array.isArray(cart) ? cart : [];

      setCartCount(
        validCart.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        )
      );
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getAllProducts();

        if (mounted) {
          setProducts(
            Array.isArray(result.products) ? result.products : []
          );
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load products. Please check your connection."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();
    refreshCartCount();

    const handleCartUpdate = () => refreshCartCount();

    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener(
      "govimart-cart-updated",
      handleCartUpdate
    );

    return () => {
      mounted = false;

      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener(
        "govimart-cart-updated",
        handleCartUpdate
      );
    };
  }, []);

  const locations = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.district?.trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.district?.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesLocation =
        location === "All" ||
        product.district?.trim() === location;

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [products, search, category, location]);

  const addToCart = (product, selectedQuantity) => {
  const quantity = Number(selectedQuantity);
  const availableQuantity = Number(product.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    alert("Please select a valid quantity.");
    return;
  }

  if (quantity > availableQuantity) {
    alert(`Only ${availableQuantity} ${product.unit} available.`);
    return;
  }

  const cart = JSON.parse(localStorage.getItem("govimartCart") || "[]");
  const productId = product._id || product.id;

  const existingItem = cart.find(
    (item) => String(item.productId) === String(productId)
  );

  if (existingItem) {
    const newQuantity = Number(existingItem.quantity) + quantity;

    if (newQuantity > availableQuantity) {
      alert(`Only ${availableQuantity} ${product.unit} available in total.`);
      return;
    }

    existingItem.quantity = newQuantity;
  } else {
    cart.push({
      productId,
      name: product.name,
      price: Number(product.price),
      unit: product.unit,
      imageUrl: product.imageUrl,
      quantity,
    });
  }

  localStorage.setItem("govimartCart", JSON.stringify(cart));
  window.dispatchEvent(new Event("govimart-cart-updated"));

  alert(`${quantity} ${product.unit} of ${product.name} added to cart.`);
};

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLocation("All");
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="consumer-dashboard">
      <ConsumerSidebar />

      <main className="consumer-dashboard-main consumer-products-main">
        <header className="consumer-dashboard-header">
          <div>
            <p className="consumer-eyebrow">CONSUMER PORTAL</p>
            <h1>Browse Products</h1>
          </div>
        </header>

        <section className="consumer-products-toolbar">
          <label className="consumer-products-search">
            <span>⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products or district..."
              aria-label="Search products or district"
            />
          </label>

          <label className="consumer-products-category-label">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
           
          <label className="consumer-products-category-label">
            <span>Farmer District</span>
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option value="All">All districts</option>

              {locations.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>
        </section>

        {message && (
          <div
            className="consumer-products-message"
            role="status"
          >
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

        <div className="consumer-products-results">
          <h2>Available Products</h2>
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}
          </span>
        </div>

        {loading ? (
          <div className="consumer-products-state">
            Loading fresh products...
          </div>
        ) : error ? (
          <div className="consumer-products-state consumer-products-error">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="consumer-products-state">
            <span>🔎</span>
            <h3>No products found</h3>
            <p>
              Try another search, category or district.
            </p>
            <button type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <section className="consumer-products-grid">
            {filteredProducts.map((product) => {
              const stock = Number(product.quantity || 0);
              const farmerDistrict =
                product.district?.trim() || "";

              return (
                <article
                  className="consumer-product-card"
                  key={product._id}
                >
                
                  <div className="consumer-product-details">
                    <span className="consumer-product-category">
                      {product.category}
                    </span>

                    <h3>{product.name}</h3>

                    <p className="consumer-product-description">
                      {product.description ||
                        "Fresh farm produce."}
                    </p>
                    <div className="consumer-product-farmer">
  <span>👨‍🌾</span>
  <span>
    Farmer:{" "}
    {product.farmerId?.farmName ||
      product.farmerId?.name ||
      "Farmer information unavailable"}
  </span>
</div>
                    <p className="consumer-product-location">
                      <span aria-hidden="true">📍</span>
                      {farmerDistrict ||
                        "District not provided"}
                    </p>

                    <div className="consumer-product-price">
                      <strong>
                        Rs. {formatPrice(product.price)}
                      </strong>
                      <span>/ {product.unit || "kg"}</span>
                    </div>

                    <p
                      className={
                        stock > 0
                          ? "consumer-product-stock"
                          : "consumer-product-stock out-of-stock"
                      }
                    >
                      {stock > 0
                        ? `${stock} ${product.unit || "units"} available`
                        : "Out of stock"}
                    </p>
                    <div className="consumer-quantity-selector">
  <label htmlFor={`quantity-${product._id}`}>
    Quantity ({product.unit})
  </label>

  <div className="consumer-quantity-controls">
    <button
      type="button"
      onClick={() =>
        setQuantities((prev) => ({
          ...prev,
          [product._id]: Math.max(
            1,
            Number(prev[product._id] || 1) - 1
          ),
        }))
      }
    >
      −
    </button>

    <input
      id={`quantity-${product._id}`}
      type="number"
      min="1"
      max={product.quantity}
      step="1"
      value={quantities[product._id] ?? 1}
      onChange={(e) =>
        setQuantities((prev) => ({
          ...prev,
          [product._id]: e.target.value,
        }))
      }
    />

    <button
      type="button"
      disabled={
        Number(quantities[product._id] ?? 1) >=
        Number(product.quantity)
      }
      onClick={() =>
        setQuantities((prev) => ({
          ...prev,
          [product._id]: Math.min(
            Number(product.quantity),
            Number(prev[product._id] || 1) + 1
          ),
        }))
      }
    >
      +
    </button>
  </div>

  <p>
    Total: Rs.{" "}
    {(
      Number(product.price) *
      Math.max(0, Number(quantities[product._id] ?? 1) || 0)
    ).toFixed(2)}
  </p>
</div>

<button
  className="consumer-product-add-button"
  onClick={() =>
    addToCart(product, quantities[product._id] ?? 1)
  }
>
  + Add to Cart
</button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default ConsumerProducts;
