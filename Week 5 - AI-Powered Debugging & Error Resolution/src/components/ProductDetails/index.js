const ProductDetails = ({ product }) => {
  return (
    <div>
      <h2>{product.title}</h2>
      {/* XSS vulnerability */}
      <div dangerouslySetInnerHTML={{ __html: product.description }} />
      {/* Unvalidated user input */}
      <img src={product.imageUrl} alt={product.title} />
      <button onClick={() => {
        // No input validation
        window.location.href = `/product/${product.id}`;
      }}>
        View Details
      </button>
    </div>
  );
}; 