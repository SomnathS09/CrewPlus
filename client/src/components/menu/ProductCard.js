import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { customizationsAPI } from '../../services/api';
import { FiPlus, FiMinus, FiShoppingCart, FiX } from 'react-icons/fi';
import { GiChiliPepper } from 'react-icons/gi';
import { TbLeaf } from 'react-icons/tb';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [isAdding, setIsAdding] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customizations, setCustomizations] = useState([]);
  const [selectedCustomizations, setSelectedCustomizations] = useState([]);
  const { addToCart } = useCart();

  const sizes = ['small', 'medium', 'large', 'extra_large'];

  useEffect(() => {
    if (showCustomizeModal && product.category === 'pizza') {
      fetchCustomizations();
    }
  }, [showCustomizeModal, product.category]);

  const fetchCustomizations = async () => {
    try {
      const response = await customizationsAPI.getCustomizations({ category: product.category });
      setCustomizations(response.data.customizations || []);
    } catch (error) {
      console.error('Failed to fetch customizations:', error);
    }
  };

  const getPrice = () => {
    if (product.prices && product.prices[selectedSize]) {
      return product.prices[selectedSize];
    }
    return product.price;
  };

  const getCustomizationTotal = () => {
    return selectedCustomizations.reduce((sum, id) => {
      const cust = customizations.find(c => c._id === id);
      return sum + (cust?.price || 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return (getPrice() + getCustomizationTotal()) * quantity;
  };

  const toggleCustomization = (custId) => {
    setSelectedCustomizations(prev =>
      prev.includes(custId)
        ? prev.filter(id => id !== custId)
        : [...prev, custId]
    );
  };

  const handleAddClick = () => {
    if (product.category === 'pizza') {
      setShowCustomizeModal(true);
    } else {
      handleAddToCart();
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product._id, quantity, selectedSize, selectedCustomizations);
    setQuantity(1);
    setSelectedCustomizations([]);
    setShowCustomizeModal(false);
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
              onClick={handleAddClick}
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

      {showCustomizeModal && (
        <div className="customize-modal-overlay" onClick={() => setShowCustomizeModal(false)}>
          <div className="customize-modal" onClick={(e) => e.stopPropagation()}>
            <div className="customize-modal-header">
              <h3>Customize Your {product.name}</h3>
              <button className="close-btn" onClick={() => setShowCustomizeModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="customize-modal-body">
              {product.prices && (
                <div className="customize-section">
                  <h4>Select Size</h4>
                  <div className="size-options">
                    {sizes.map(size => (
                      product.prices[size] && (
                        <button
                          key={size}
                          className={`size-option ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          <span className="size-name">{size.replace('_', ' ')}</span>
                          <span className="size-price">₹{product.prices[size]}</span>
                        </button>
                      )
                    ))}
                  </div>
                </div>
              )}

              {customizations.length > 0 && (
                <>
                  {['crust', 'sauce', 'cheese', 'topping', 'extra'].map(type => {
                    const typeCustomizations = customizations.filter(c => c.type === type);
                    if (typeCustomizations.length === 0) return null;
                    return (
                      <div key={type} className="customize-section">
                        <h4>{type.charAt(0).toUpperCase() + type.slice(1)} Options</h4>
                        <div className="customization-options">
                          {typeCustomizations.map(cust => (
                            <label
                              key={cust._id}
                              className={`customization-option ${selectedCustomizations.includes(cust._id) ? 'selected' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedCustomizations.includes(cust._id)}
                                onChange={() => toggleCustomization(cust._id)}
                              />
                              <span className="option-name">
                                {cust.name}
                                {cust.isVegetarian && <TbLeaf className="veg-icon" />}
                              </span>
                              <span className="option-price">+₹{cust.price}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              <div className="customize-section">
                <h4>Quantity</h4>
                <div className="quantity-control modal-quantity">
                  <button onClick={decrementQuantity} disabled={quantity <= 1}>
                    <FiMinus />
                  </button>
                  <span>{quantity}</span>
                  <button onClick={incrementQuantity}>
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>

            <div className="customize-modal-footer">
              <div className="total-price">
                <span>Total:</span>
                <span className="price">₹{getTotalPrice()}</span>
              </div>
              <button
                className="btn btn-primary add-btn"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
