import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../services/productService";
import "./Consumer.css";

function ConsumerProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getAllProducts();
        setProducts(result.products || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = ["All", "Vegetables", "Fruits", "Grains", "Other"];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const handleAddToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("govimartCart") || "[]");
      const existing = cart.find((item) => item.productId === product._id);

      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert("You cannot add more than the available stock.");
          return;
        }
        existing.quantity += 1;
      } else {
        if (product.quantity < 1) {
          alert("This product is currently out of stock.");
          return;
        }

        cart.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          imageUrl: product.imageUrl || "",
          quantity: 1,
        });
      }

      localStorage.setItem("govimartCart", JSON.stringify(cart));
      alert(`${product.name} added to cart.`);
    } catch {
      alert("Unable to update your cart. Please try again.");
    }
  };

  return (
    <div className="consumer-page">
      <header className="consumer-navbar">
        <h2 className="consumer-brand">🌿 GoviMart</h2>

        <nav>
          <button onClick={() => navigate("/consumer")}>Home</button>
          <button
            className="consumer-nav-active"
            onClick={() => navigate("/consumer/products")}
          >
            Products
          </button>
          <button onClick={() => navigate("/consumer/cart")}>Cart</button>
        </nav>
      </header>

      <main className="consumer-products-page">
        <section className="consumer-products-heading">
          <p className="consumer-eyebrow">FRESH FROM LOCAL FARMS</p>
          <h1>Explore Fresh Products</h1>
          <p>Discover fresh produce offered by GoviMart farmers.</p>
        </section>

        <section className="consumer-product-tools">
          <input
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </section>

        {loading && <p className="consumer-message">Loading products...</p>}

        {!loading && error && (
          <div className="consumer-message consumer-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="consumer-message">
            <h2>No products found</h2>
            <p>Try another search or category.</p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <section className="consumer-product-grid">
            {filteredProducts.map((product) => (
              <article className="consumer-product-card" key={product._id}>
                <div className="consumer-product-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <span>🌱</span>
                  )}
                </div>

                <div className="consumer-product-details">
                  <span className="consumer-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>
                  <p className="consumer-product-description">
                    {product.description}
                  </p>

                  <p className="consumer-price">
                    Rs. {Number(product.price).toFixed(2)} / {product.unit}
                  </p>

                  <p className="consumer-stock">
                    {product.quantity > 0
                      ? `${product.quantity} ${product.unit} available`
                      : "Out of stock"}
                  </p>

                  <button
                    className="consumer-primary-button consumer-cart-button"
                    disabled={product.quantity <= 0}
                    onClick={() => handleAddToCart(product)}
                  >
                    {product.quantity > 0 ? "＋ Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default ConsumerProducts;
