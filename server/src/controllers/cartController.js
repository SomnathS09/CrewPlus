const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Customization = require('../models/Customization');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Helper to get or create cart
const getOrCreateCart = async (userId, sessionId) => {
  let cart;

  if (userId) {
    cart = await Cart.findOne({ user: userId }).populate('items.product');
  } else if (sessionId) {
    cart = await Cart.findOne({ sessionId }).populate('items.product');
  }

  if (!cart) {
    cart = new Cart({
      user: userId || undefined,
      sessionId: userId ? undefined : sessionId,
      items: []
    });
    await cart.save();
  }

  return cart;
};

// @desc    Get cart
// @route   GET /api/cart
// @access  Public (session-based) / Private (user-based)
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const sessionId = req.headers['x-session-id'];

  if (!userId && !sessionId) {
    throw ApiError.badRequest('Session ID required for guest cart');
  }

  const cart = await getOrCreateCart(userId, sessionId);

  ApiResponse.success({ cart }).send(res);
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Public (session-based) / Private (user-based)
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, size = 'medium', notes, customizations = [] } = req.body;
  const userId = req.user?._id;
  const sessionId = req.headers['x-session-id'];

  if (!userId && !sessionId) {
    throw ApiError.badRequest('Session ID required for guest cart');
  }

  // Check if product exists and has stock
  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (!product.isAvailable) {
    throw ApiError.badRequest('Product is not available');
  }

  if (!product.hasStock(quantity)) {
    throw ApiError.badRequest(`Only ${product.inventory} items available in stock`);
  }

  // Get or create cart
  let cart = await getOrCreateCart(userId, sessionId);

  // Calculate price based on size
  let price = product.price;
  if (product.prices && product.prices[size]) {
    price = product.prices[size];
  }

  // Process customizations if provided
  let processedCustomizations = [];
  let customizationTotal = 0;

  if (customizations.length > 0) {
    const customizationIds = customizations.map(c => c.customizationId || c);
    const customizationDocs = await Customization.find({
      _id: { $in: customizationIds },
      isAvailable: true
    });

    processedCustomizations = customizationDocs.map(cust => ({
      customization: cust._id,
      name: cust.name,
      price: cust.price
    }));

    customizationTotal = processedCustomizations.reduce((sum, c) => sum + c.price, 0);
  }

  // Add item to cart with customizations
  await cart.addItem(productId, quantity, size, price, notes, processedCustomizations, customizationTotal);

  // Reload with populated data
  cart = await Cart.findById(cart._id).populate('items.product');

  ApiResponse.success({ cart }, 'Item added to cart').send(res);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Public (session-based) / Private (user-based)
const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user?._id;
  const sessionId = req.headers['x-session-id'];

  if (!userId && !sessionId) {
    throw ApiError.badRequest('Session ID required for guest cart');
  }

  let cart;
  if (userId) {
    cart = await Cart.findOne({ user: userId });
  } else {
    cart = await Cart.findOne({ sessionId });
  }

  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw ApiError.notFound('Item not found in cart');
  }

  // Check stock if increasing quantity
  if (quantity > item.quantity) {
    const product = await Product.findById(item.product);
    if (!product.hasStock(quantity)) {
      throw ApiError.badRequest(`Only ${product.inventory} items available in stock`);
    }
  }

  await cart.updateItemQuantity(itemId, quantity);

  // Reload with populated data
  cart = await Cart.findById(cart._id).populate('items.product');

  ApiResponse.success({ cart }, 'Cart updated').send(res);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Public (session-based) / Private (user-based)
const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user?._id;
  const sessionId = req.headers['x-session-id'];

  if (!userId && !sessionId) {
    throw ApiError.badRequest('Session ID required for guest cart');
  }

  let cart;
  if (userId) {
    cart = await Cart.findOne({ user: userId });
  } else {
    cart = await Cart.findOne({ sessionId });
  }

  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  await cart.removeItem(itemId);

  // Reload with populated data
  cart = await Cart.findById(cart._id).populate('items.product');

  ApiResponse.success({ cart }, 'Item removed from cart').send(res);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Public (session-based) / Private (user-based)
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const sessionId = req.headers['x-session-id'];

  if (!userId && !sessionId) {
    throw ApiError.badRequest('Session ID required for guest cart');
  }

  let cart;
  if (userId) {
    cart = await Cart.findOne({ user: userId });
  } else {
    cart = await Cart.findOne({ sessionId });
  }

  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  await cart.clearCart();

  ApiResponse.success({ cart }, 'Cart cleared').send(res);
});

// @desc    Merge guest cart with user cart after login
// @route   POST /api/cart/merge
// @access  Private
const mergeCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user._id;

  if (!sessionId) {
    throw ApiError.badRequest('Session ID required');
  }

  // Find guest cart
  const guestCart = await Cart.findOne({ sessionId }).populate('items.product');

  if (!guestCart || guestCart.items.length === 0) {
    // No guest cart to merge, just return user's cart
    let userCart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!userCart) {
      userCart = await Cart.create({ user: userId, items: [] });
    }
    return ApiResponse.success({ cart: userCart }).send(res);
  }

  // Get or create user cart
  let userCart = await Cart.findOne({ user: userId });
  if (!userCart) {
    userCart = await Cart.create({ user: userId, items: [] });
  }

  // Merge items
  for (const guestItem of guestCart.items) {
    const existingItem = userCart.items.find(
      item => item.product.toString() === guestItem.product._id.toString() &&
              item.size === guestItem.size
    );

    if (existingItem) {
      existingItem.quantity += guestItem.quantity;
    } else {
      userCart.items.push({
        product: guestItem.product._id,
        quantity: guestItem.quantity,
        size: guestItem.size,
        price: guestItem.price,
        notes: guestItem.notes
      });
    }
  }

  await userCart.save();

  // Delete guest cart
  await Cart.findByIdAndDelete(guestCart._id);

  // Reload with populated data
  userCart = await Cart.findById(userCart._id).populate('items.product');

  ApiResponse.success({ cart: userCart }, 'Cart merged successfully').send(res);
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart
};
