import { useEffect, useState } from "react";
import {
  addProduct,
  updateProduct,
} from "../../services/productService";
import "../../App.css";

function AddProduct({ product = null, onProductAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Vegetables",
    price: "",
    quantity: "",
    unit: "kg",
    imageUrl: "",
  });

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
        quantity: product.quantity ?? "",
        unit: product.unit || "kg",
        imageUrl: product.imageUrl || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "Vegetables",
        price: "",
        quantity: "",
        unit: "kg",
        imageUrl: "",
      });
    }

    setError("");
  }, [product]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      formData.price === "" ||
      formData.quantity === ""
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) <= 0 ||
      !Number.isFinite(Number(formData.quantity)) ||
      Number(formData.quantity) < 0
    ) {
      setError(
        "Enter a valid price greater than zero and a non-negative quantity."
      );
      return;
    }

    try {
      setLoading(true);

      const productData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
      };

      if (isEditing) {
        await updateProduct(product._id, productData);
      } else {
        await addProduct(productData);
      }

      await onProductAdded();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "add"} product. Please try again.`
      );
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