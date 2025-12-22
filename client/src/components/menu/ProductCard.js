import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import { GiChiliPepper } from 'react-icons/gi';
import { TbLeaf } from 'react-icons/tb';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const sizes = ['small', 'medium', 'large', 'extra_large'];

  const getPrice = () => {
    if (product.prices && product.prices[selectedSize]) {
      return product.prices[selectedSize];
    }
    return product.price;
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product._id, quantity, selectedSize);
    setQuantity(1);
    setIsAdding(false);
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.imageUrl || '/placeholder-pizza.jpg'}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500';
          }}
        />
        <div className="product-badges">
          {product.isVegetarian && (
            <span className="badge badge-veg">
              <TbLeaf /> Veg
            </span>
          )}
          {product.isSpicy && (
            <span className="badge badge-spicy">
              <GiChiliPepper /> Spicy
            </span>
          )}
        </div>
        {product.inventory < 10 && product.inventory > 0 && (
          <span className="low-stock-badge">Only {product.inventory} left!</span>
        )}
      </div>

      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        {product.ingredients && product.ingredients.length > 0 && (
          <div className="product-ingredients">
            {product.ingredients.slice(0, 4).join(' • ')}
            {product.ingredients.length > 4 && ' ...'}
          </div>
        )}

        {product.category === 'pizza' && product.prices && (
          <div className="size-selector">
            {sizes.map(size => (
              product.prices[size] && (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size.charAt(0).toUpperCase()}
                </button>
              )
            ))}
          </div>
        )}

        <div className="product-footer">
          <div className="product-price">
            <span className="currency">&#8377;</span>
            <span className="amount">{getPrice()}</span>
          </div>

          <div className="product-actions">
            <div className="quantity-control">
              <button onClick={decrementQuantity} disabled={quantity <= 1}>
                <FiMinus />
              </button>
              <span>{quantity}</span>
              <button onClick={incrementQuantity}>
                <FiPlus />
              </button>
            </div>

            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={isAdding || product.inventory === 0}
            >
              {isAdding ? (
                <span className="loading-spinner small"></span>
              ) : (
                <>
                  <FiShoppingCart />
                  {product.inventory === 0 ? 'Out of Stock' : 'Add'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
