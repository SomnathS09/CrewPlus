module.exports = {
  // User Roles
  ROLES: {
    GUEST: 'guest',
    CUSTOMER: 'customer',
    ADMIN: 'admin'
  },

  // Product Categories
  CATEGORIES: {
    PIZZA: 'pizza',
    DRINK: 'drink',
    BREAD: 'bread'
  },

  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },

  // Order Types
  ORDER_TYPES: {
    DELIVERY: 'delivery',
    CARRYOUT: 'carryout'
  },

  // Pizza Sizes
  SIZES: {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    EXTRA_LARGE: 'extra_large'
  },

  // Coupon Types
  COUPON_TYPES: {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed'
  },

  // Customization Categories
  CUSTOMIZATION_TYPES: {
    CRUST: 'crust',
    SAUCE: 'sauce',
    CHEESE: 'cheese',
    TOPPING: 'topping',
    EXTRA: 'extra'
  }
};
