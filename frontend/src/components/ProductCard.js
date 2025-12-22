import React from 'react';
import { formatPrice } from '../utils/helpers';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = React.useState(1);
  const [adding, setAdding] = React.useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await onAddToCart(product._id, quantity);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Error will be handled by parent component with toast
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} className="product-image" />
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className="product-inventory">
          {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
        </p>
        <div className="product-actions">
          <input
            type="number"
            min="1"
            max={product.inventory}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="quantity-input"
            disabled={product.inventory === 0}
          />
          <button
            onClick={handleAddToCart}
            disabled={product.inventory === 0 || adding}
            className="add-to-cart-btn"
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
