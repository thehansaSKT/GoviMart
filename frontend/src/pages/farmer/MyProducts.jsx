import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import ProductCard from "../../components/ProductCard";
import EmptyProducts from "../../components/EmptyProducts";
import {
  getAllProducts,
  deleteProduct,
} from "../../services/productService";

import "../../App.css";

function MyProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = sessionStorage.getItem("goviUser");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!sessionStorage.getItem("goviToken") || !user?._id) {
        navigate("/login/farmer", { replace: true });
        return;
      }

      if (user.role !== "farmer") {
        setError("This page is available to farmer accounts only.");
        setProducts([]);
        return;
      }

      const data = await getAllProducts();
      const allProducts = Array.isArray(data.products)
        ? data.products
        : [];

      const farmerProducts = allProducts.filter((product) => {
        const ownerId =
          typeof product.farmerId === "object"
            ? product.farmerId?._id
            : product.farmerId;

        return ownerId && String(ownerId) === String(user._id);
      });

      setProducts(farmerProducts);
    } catch (err) {
      console.error("Error loading products:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load products. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to delete product. Please try again."
      );
    }
  };

  const handleEdit = (product) => {
    navigate("/farmer/add-product", {
      state: { product },
    });
  };

  const handleAddProduct = () => {
    navigate("/farmer/add-product");
  };

  return (
    <div className="farmer-dashboard">
      <Sidebar onAddProduct={handleAddProduct} />

      <main className="main-content">
        <Header title="My Products" />

        <section className="content-panel" id="products">
          <div className="panel-heading">
            <div>
              <h2>My Products</h2>
              <p>Manage your listed farm products</p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/farmer/dashboard")}
            >
              Cancel
            </button>
          </div>

          {loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <div>
              <p>{error}</p>
              <button
                type="button"
                className="secondary-button"
                onClick={fetchProducts}
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <EmptyProducts onAddProduct={handleAddProduct} />
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MyProducts;
