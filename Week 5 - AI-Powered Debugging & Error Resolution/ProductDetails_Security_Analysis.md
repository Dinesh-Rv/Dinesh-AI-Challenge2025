# ProductDetails Component – Security Vulnerability Analysis

## 1. XSS Vulnerabilities & Unsafe HTML Rendering
- **Risk:** Using `dangerouslySetInnerHTML` with untrusted content (`product.description`) can allow attackers to inject malicious scripts (XSS).
- **Secure Alternative:** Sanitize HTML before rendering, or avoid using `dangerouslySetInnerHTML` entirely. Use a library like `dompurify` to sanitize HTML.

## 2. Input Validation Issues
- **Risk:** Directly using `product.imageUrl` and `product.id` without validation can allow attackers to inject malicious URLs or unexpected values.
- **Secure Alternative:** Validate and sanitize all user-provided or external data before use. For images, check for valid URLs and allowed domains. For IDs, ensure they are the expected type/format.

## 3. URL/Navigation Security
- **Risk:** Using `window.location.href` with unvalidated input can lead to open redirects or navigation to malicious URLs if `product.id` is manipulated.
- **Secure Alternative:** Validate `product.id` (e.g., ensure it's a number or matches a known pattern). Use React Router's navigation methods for internal navigation.

## 4. Image Source Validation
- **Risk:** Unvalidated image URLs can be used for phishing, tracking, or loading malicious content.
- **Secure Alternative:** Only allow images from trusted sources. Optionally, use a proxy or CDN to serve images.

---

## Corrected Code Example
```jsx
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
```

---

## Summary Table
| Issue                | Risk/Problem                        | Secure Solution                  |
|----------------------|-------------------------------------|----------------------------------|
| XSS                  | Untrusted HTML rendering            | Sanitize with DOMPurify          |
| Input validation     | Unchecked imageUrl, id              | Validate/sanitize all inputs     |
| URL/navigation       | Unvalidated id in navigation        | Validate id, use router          |
| Image source         | Untrusted image URLs                | Allow only trusted sources       |

---
**Always validate and sanitize all user or external data before rendering or using in navigation!** 