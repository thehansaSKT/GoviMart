import { useEffect, useState } from "react";
import {
  addProduct,
  updateProduct,
} from "../../services/productService";
import "./Farmer.css";

const districts = [
  "Colombo", "Gampaha", "Kalutara", "Kandy",
  "Matale", "Nuwara Eliya", "Galle", "Matara",
  "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara",
  "Trincomalee", "Kurunegala", "Puttalam",
  "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

const initialForm = {
  name: "",
  description: "",
  category: "Vegetables",
  price: "",
  initialStock: "",
  quantity: "",
  unit: "kg",
  imageUrl: "",
  district: "",
};

function AddProduct({ product = null, onProductAdded, onCancel }) {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(product);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "Vegetables",
        price: product.price ?? "",
        initialStock: product.initialStock ?? product.quantity ?? "",
        quantity: product.quantity ?? "",
        unit: product.unit || "kg",
        imageUrl: product.imageUrl || "",
        district: product.district || "",
      });
    } else {
      setFormData({ ...initialForm });
    }

    setError("");
  }, [product]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      const next = { ...previous, [name]: value };

      if (name === "initialStock" && !isEditing) {
        next.quantity = value;
      }

      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const token = sessionStorage.getItem("goviToken");

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      formData.price === "" ||
      formData.initialStock === "" ||
      formData.quantity === "" ||
      !formData.district
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const price = Number(formData.price);
    const initialStock = Number(formData.initialStock);
    const quantity = Number(formData.quantity);

    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isFinite(initialStock) ||
      initialStock < 0 ||
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      (!isEditing && quantity !== initialStock) ||
      quantity > initialStock
    ) {
      setError(
        "Enter a valid price and stock. Available stock cannot exceed initial stock."
      );
      return;
    }

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      price,
      initialStock,
      quantity,
      unit: formData.unit,
      imageUrl: formData.imageUrl.trim(),
      district: formData.district,
    };

    try {
      setLoading(true);

      if (isEditing) {
        await updateProduct(product._id, productData);
      } else {
    
        await addProduct(productData);
      }

      if (onProductAdded) {
        await onProductAdded();
      }
    } catch (err) {
      console.error("Product save error:", err);

      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${isEditing ? "update" : "add"} product.`;

      if (status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else if (status === 403) {
        setError("Only an authenticated farmer can manage farm products.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-panel add-product-panel">
      <div className="panel-heading">
        <div>
          <h2>{isEditing ? "Edit Product" : "Add New Product"}</h2>
          <p>
            {isEditing
              ? "Update your product details."
              : "List your fresh farm products on GoviMart."}
          </p>
        </div>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="product-name">Product Name *</label>
          <input
            id="product-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-category">Category *</label>
          <select
            id="product-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Grains">Grains</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label htmlFor="product-description">Description *</label>
          <textarea
            id="product-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={1000}
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-price">Price (Rs.) *</label>
          <input
            id="product-price"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-initial-stock">Initial Stock *</label>
          <input
            id="product-initial-stock"
            name="initialStock"
            type="number"
            min="0"
            step="any"
            value={formData.initialStock}
            onChange={handleChange}
            required
            disabled={isEditing}
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-quantity">Available Quantity *</label>
          <input
            id="product-quantity"
            name="quantity"
            type="number"
            min="0"
            step="any"
            value={formData.quantity}
            onChange={handleChange}
            required
            disabled={!isEditing}
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-unit">Unit *</label>
          <select
            id="product-unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            required
          >
            <option value="kg">Kilogram (kg)</option>
            <option value="g">Gram (g)</option>
            <option value="piece">Piece</option>
            <option value="litre">Litre</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="district">District *</label>
          <select
            id="district"
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
          >
            <option value="">Select district</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="form-error full-width" role="alert">
            {error}
          </p>
        )}

        <div className="form-actions full-width">
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEditing
                ? "Update Product"
                : "Save Product"}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddProduct;
