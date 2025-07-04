import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const isValidImageUrl = (url) => {
  try {
    const parsed = new URL(url, window.location.origin);
    // Optionally, restrict to certain domains:
    // return parsed.origin === window.location.origin;
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const ProductDetails = ({ product }) => {
  const navigate = useNavigate();
  const safeDescription = DOMPurify.sanitize(product.description || "");
  const safeImageUrl = isValidImageUrl(product.imageUrl) ? product.imageUrl : "/placeholder.png";
  const safeId = typeof product.id === 'number' || /^[a-zA-Z0-9_-]+$/.test(product.id) ? product.id : '';

  return (
    <div>
      <h2>{product.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: safeDescription }} />
      <img src={safeImageUrl} alt={product.title} />
      <button onClick={() => {
        if (safeId) navigate(`/product/${safeId}`);
      }}>
        View Details
      </button>
    </div>
  );
};

ProductDetails.propTypes = {
  product: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
}; 