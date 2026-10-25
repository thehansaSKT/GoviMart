import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import EmptyProducts from "../../components/EmptyProducts";
import ProductCard from "../../components/ProductCard";
import AddProduct from "./AddProduct";

import { getAllProducts } from "../../services/productService";
import { deleteProduct } from "../../services/productService";

import "../../App.css";

function FarmerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load products. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalProducts = products.length;

  const availableStock = products.reduce(
    (total, product) =>
      total + Math.max(0, Number(product.quantity) || 0),
    0
  );

 const handleEdit = (product) => {
  setSelectedProduct(product);
  setShowAddForm(true);
};

const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) return;

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


const handleAddProduct = () => {
  setSelectedProduct(null);
  setShowAddForm(true);
};

const handleProductAdded = async () => {
  await fetchProducts();
  setShowAddForm(false);
  setSelectedProduct(null);
};

  return (
    <div className="farmer-dashboard">
      <Sidebar onAddProduct={handleAddProduct} />

      <main className="main-content">
        <Header />
       {showAddForm ? (
  <AddProduct
    product={selectedProduct}
    onProductAdded={handleProductAdded}
    onCancel={() => {
      setShowAddForm(false);
      setSelectedProduct(null);
    }}
  />
) : (
  <>
  

        <section className="welcome-section" id="dashboard">
          <div>
            <p className="eyebrow">WELCOME TO GOVIMART</p>

            <h1>Your farm, your marketplace.</h1>

            <p>
              Manage your products, track your stock, and connect
              with customers directly.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={handleAddProduct}
            >
              + Add New Product
            </button>
          </div>

          <div className="welcome-icon">
            <img
              src="/govimart-welcome.png"
              alt="Farmer holding a crate of fresh produce"
            />
          </div>
        </section>

        <section className="stats-grid">
          <StatCard
            icon="▣"
            title="Total Products"
            value={totalProducts}
            description="Products listed"
            iconClass="green-icon"
          />

          <StatCard
            icon="▤"
            title="Available Stock"
            value={availableStock}
            description="Total units in stock"
            iconClass="orange-icon"
          />

          <StatCard
            icon="🛒"
            title="Total Orders"
            value={0}
            description="Orders received"
            iconClass="blue-icon"
          />

          <StatCard
            icon="Rs."
            title="Sales Revenue"
            value="Rs. 0.00"
            description="Total sales"
            iconClass="purple-icon"
          />
        </section>

        <section className="content-panel" id="products">
          <div className="panel-heading">
            <div>
              <h2>My Products</h2>
              <p>Your recently listed farm products</p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={fetchProducts}
            >
              Refresh
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

        <footer className="dashboard-footer">
          © 2026 GoviMart. Connecting farmers and consumers.
        </footer>
        </>
)}

      </main>
    </div>
  );
}
  
export default FarmerDashboard;
