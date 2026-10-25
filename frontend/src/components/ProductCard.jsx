function ProductCard({ product, onEdit, onDelete }) {
  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">
            🌾
          </div>
        )}
      </div>

      <div className="product-details">
        <span className="product-category">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <p className="product-description">
          {product.description}
        </p>

        <p className="product-price">
          Rs. {Number(product.price).toFixed(2)} / {product.unit}
        </p>

        <p className="product-quantity">
          Stock: {product.quantity} {product.unit}
        </p>

        <div className="product-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => onEdit(product)}
          >
            Edit
          </button>

          <button
            type="button"
            className="delete-button"
            onClick={() => onDelete(product._id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
