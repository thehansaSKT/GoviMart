import { useState } from "react";
import { addProduct } from "../../services/productService";
import "../../App.css";

function AddProduct({ onProductAdded, onCancel }) {
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

    if (Number(formData.price) <= 0 || Number(formData.quantity) < 0) {
      setError("Price must be greater than zero and quantity cannot be negative.");
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

      await addProduct(productData);

      alert("Product added successfully!");
      onProductAdded();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not add product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-panel add-product-panel">
      <div className="panel-heading">
        <div>
          <h2>Add New Product</h2>
          <p>List your fresh farm products on GoviMart.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
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
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={1000}
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (Rs.) *</label>
          <input
            id="price"
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
          <label htmlFor="quantity">Available Quantity *</label>
          <input
            id="quantity"
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
          <label htmlFor="unit">Unit *</label>
          <select
            id="unit"
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
            {loading ? "Saving..." : "Save Product"}
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
