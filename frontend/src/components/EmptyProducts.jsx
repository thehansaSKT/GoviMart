function EmptyProducts({ onAddProduct }) {
  return (
    <div className="empty-state">
      <img
        src="/empty-products.png"
        alt="No products available"
        className="empty-icon"
      />

      <h3>No Products Yet</h3>

      <p>
        You haven't added any products to GoviMart.
        Start by listing your first product!
      </p>

      <button
        type="button"
        className="primary-button"
        onClick={onAddProduct}
      >
        + Add Your First Product
      </button>
    </div>
  );
}

export default EmptyProducts;
