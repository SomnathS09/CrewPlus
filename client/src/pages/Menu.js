import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/menu/ProductCard';
import Loading from '../components/common/Loading';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { GiFullPizza, GiSodaCan, GiHotMeal } from 'react-icons/gi';
import { TbLeaf } from 'react-icons/tb';
import './Menu.css';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [filters, setFilters] = useState({
    isVegetarian: searchParams.get('isVegetarian') === 'true',
    isSpicy: false,
    inStock: true
  });

  const categories = [
    { id: 'all', name: 'All', icon: null },
    { id: 'pizza', name: 'Pizzas', icon: <GiFullPizza /> },
    { id: 'drink', name: 'Drinks', icon: <GiSodaCan /> },
    { id: 'bread', name: 'Breads', icon: <GiHotMeal /> }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory !== 'all') params.category = activeCategory;
        if (searchTerm) params.search = searchTerm;
        if (filters.isVegetarian) params.isVegetarian = true;
        if (filters.inStock) params.inStock = true;

        const response = await productsAPI.getProducts(params);
        let filtered = response.data.products;

        if (filters.isSpicy) {
          filtered = filtered.filter(p => p.isSpicy);
        }

        setProducts(filtered);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, searchTerm, filters]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
  };

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  return (
    <div className="menu-page">
      <div className="menu-header">
        <div className="container">
          <h1 className="menu-title">Our Menu</h1>
          <p className="menu-subtitle">
            Explore our delicious selection of pizzas, drinks, and sides
          </p>
        </div>
      </div>

      <div className="menu-container container">
        {/* Filters Sidebar */}
        <aside className="menu-sidebar">
          {/* Search */}
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="filter-section">
            <h3>Categories</h3>
            <div className="category-filters">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.icon && <span className="cat-icon">{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Filters */}
          <div className="filter-section">
            <h3>
              <FiFilter /> Filters
            </h3>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.isVegetarian}
                  onChange={() => handleFilterChange('isVegetarian')}
                />
                <span className="checkmark"></span>
                <TbLeaf className="filter-icon veg" />
                Vegetarian Only
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.isSpicy}
                  onChange={() => handleFilterChange('isSpicy')}
                />
                <span className="checkmark"></span>
                <span className="filter-icon spicy">🌶️</span>
                Spicy Items
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={() => handleFilterChange('inStock')}
                />
                <span className="checkmark"></span>
                In Stock Only
              </label>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="menu-content">
          {loading ? (
            <Loading />
          ) : products.length === 0 ? (
            <div className="no-products">
              <img
                src="https://illustrations.popsy.co/gray/crashed-error.svg"
                alt="No products"
              />
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              <div className="menu-info">
                <span className="product-count">{products.length} items found</span>
              </div>
              <div className="products-grid grid grid-3">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Menu;
