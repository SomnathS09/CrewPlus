require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const users = [
  {
    name: 'Admin User',
    email: 'admin@crewplus.com',
    password: 'admin123',
    phone: '1234567890',
    role: 'admin',
    address: {
      street: '123 Admin St',
      city: 'Pizza City',
      state: 'PC',
      zipCode: '12345'
    }
  },
  {
    name: 'John Customer',
    email: 'john@example.com',
    password: 'customer123',
    phone: '9876543210',
    role: 'customer',
    address: {
      street: '456 Customer Ave',
      city: 'Order Town',
      state: 'OT',
      zipCode: '54321'
    }
  },
  {
    name: 'Jane Customer',
    email: 'jane@example.com',
    password: 'customer123',
    phone: '5555555555',
    role: 'customer'
  }
];

const products = [
  // Pizzas
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh tomato sauce, mozzarella cheese, and basil leaves',
    category: 'pizza',
    price: 299,
    prices: { small: 199, medium: 299, large: 399, extra_large: 499 },
    inventory: 50,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
    ingredients: ['Tomato Sauce', 'Mozzarella', 'Basil', 'Olive Oil'],
    isVegetarian: true,
    isSpicy: false,
    tags: ['classic', 'vegetarian', 'bestseller']
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Loaded with spicy pepperoni slices and melted mozzarella cheese',
    category: 'pizza',
    price: 349,
    prices: { small: 249, medium: 349, large: 449, extra_large: 549 },
    inventory: 45,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
    ingredients: ['Tomato Sauce', 'Mozzarella', 'Pepperoni'],
    isVegetarian: false,
    isSpicy: true,
    tags: ['meat', 'spicy', 'popular']
  },
  {
    name: 'BBQ Chicken Pizza',
    description: 'Grilled chicken with BBQ sauce, red onions, and cilantro',
    category: 'pizza',
    price: 399,
    prices: { small: 299, medium: 399, large: 499, extra_large: 599 },
    inventory: 40,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
    ingredients: ['BBQ Sauce', 'Mozzarella', 'Grilled Chicken', 'Red Onion', 'Cilantro'],
    isVegetarian: false,
    isSpicy: false,
    tags: ['chicken', 'bbq']
  },
  {
    name: 'Veggie Supreme',
    description: 'Loaded with bell peppers, mushrooms, olives, onions, and tomatoes',
    category: 'pizza',
    price: 349,
    prices: { small: 249, medium: 349, large: 449, extra_large: 549 },
    inventory: 35,
    imageUrl: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=500',
    ingredients: ['Tomato Sauce', 'Mozzarella', 'Bell Peppers', 'Mushrooms', 'Olives', 'Onions', 'Tomatoes'],
    isVegetarian: true,
    isSpicy: false,
    tags: ['vegetarian', 'healthy']
  },
  {
    name: 'Meat Lovers',
    description: 'Pepperoni, sausage, bacon, ham, and ground beef',
    category: 'pizza',
    price: 449,
    prices: { small: 349, medium: 449, large: 549, extra_large: 649 },
    inventory: 30,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
    ingredients: ['Tomato Sauce', 'Mozzarella', 'Pepperoni', 'Sausage', 'Bacon', 'Ham', 'Ground Beef'],
    isVegetarian: false,
    isSpicy: false,
    tags: ['meat', 'hearty', 'bestseller']
  },
  {
    name: 'Spicy Jalapeño',
    description: 'Hot and spicy with jalapeños, pepperoni, and crushed red pepper',
    category: 'pizza',
    price: 379,
    prices: { small: 279, medium: 379, large: 479, extra_large: 579 },
    inventory: 25,
    imageUrl: 'https://images.unsplash.com/photo-1458642849426-cfb724f15ef7?w=500',
    ingredients: ['Tomato Sauce', 'Mozzarella', 'Jalapeños', 'Pepperoni', 'Crushed Red Pepper'],
    isVegetarian: false,
    isSpicy: true,
    tags: ['spicy', 'hot']
  },
  {
    name: 'Hawaiian Pizza',
    description: 'Ham and pineapple with mozzarella cheese',
    category: 'pizza',
    price: 349,
    prices: { small: 249, medium: 349, large: 449, extra_large: 549 },
    inventory: 40,
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
    ingredients: ['Tomato Sauce', 'Mozzarella', 'Ham', 'Pineapple'],
    isVegetarian: false,
    isSpicy: false,
    tags: ['tropical', 'sweet']
  },
  {
    name: 'Four Cheese Pizza',
    description: 'Mozzarella, cheddar, parmesan, and gorgonzola cheese blend',
    category: 'pizza',
    price: 379,
    prices: { small: 279, medium: 379, large: 479, extra_large: 579 },
    inventory: 35,
    imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500',
    ingredients: ['Tomato Sauce', 'Mozzarella', 'Cheddar', 'Parmesan', 'Gorgonzola'],
    isVegetarian: true,
    isSpicy: false,
    tags: ['cheese', 'vegetarian', 'premium']
  },

  // Drinks
  {
    name: 'Coca-Cola',
    description: 'Classic Coca-Cola 500ml',
    category: 'drink',
    price: 49,
    inventory: 100,
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500',
    isVegetarian: true,
    tags: ['soda', 'classic']
  },
  {
    name: 'Pepsi',
    description: 'Refreshing Pepsi 500ml',
    category: 'drink',
    price: 49,
    inventory: 100,
    imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500',
    isVegetarian: true,
    tags: ['soda']
  },
  {
    name: 'Sprite',
    description: 'Lemon-lime flavored Sprite 500ml',
    category: 'drink',
    price: 49,
    inventory: 80,
    imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500',
    isVegetarian: true,
    tags: ['soda', 'lemon']
  },
  {
    name: 'Fanta Orange',
    description: 'Orange flavored Fanta 500ml',
    category: 'drink',
    price: 49,
    inventory: 75,
    imageUrl: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=500',
    isVegetarian: true,
    tags: ['soda', 'orange']
  },
  {
    name: 'Mineral Water',
    description: 'Pure mineral water 500ml',
    category: 'drink',
    price: 29,
    inventory: 150,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500',
    isVegetarian: true,
    tags: ['water', 'healthy']
  },
  {
    name: 'Iced Tea',
    description: 'Refreshing lemon iced tea 500ml',
    category: 'drink',
    price: 59,
    inventory: 60,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
    isVegetarian: true,
    tags: ['tea', 'refreshing']
  },

  // Breads
  {
    name: 'Garlic Bread',
    description: 'Crispy bread with garlic butter and herbs',
    category: 'bread',
    price: 99,
    inventory: 60,
    imageUrl: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=500',
    ingredients: ['Bread', 'Garlic', 'Butter', 'Herbs'],
    isVegetarian: true,
    tags: ['appetizer', 'bestseller']
  },
  {
    name: 'Cheesy Garlic Bread',
    description: 'Garlic bread topped with melted mozzarella cheese',
    category: 'bread',
    price: 129,
    inventory: 50,
    imageUrl: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=500',
    ingredients: ['Bread', 'Garlic', 'Butter', 'Mozzarella'],
    isVegetarian: true,
    tags: ['appetizer', 'cheesy']
  },
  {
    name: 'Breadsticks',
    description: 'Soft breadsticks with marinara dipping sauce',
    category: 'bread',
    price: 79,
    inventory: 70,
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500',
    ingredients: ['Flour', 'Yeast', 'Butter', 'Herbs'],
    isVegetarian: true,
    tags: ['appetizer', 'snack']
  },
  {
    name: 'Stuffed Crust Bread',
    description: 'Bread stuffed with cheese and herbs, served with dipping sauce',
    category: 'bread',
    price: 149,
    inventory: 40,
    imageUrl: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=500',
    ingredients: ['Bread', 'Mozzarella', 'Herbs', 'Marinara'],
    isVegetarian: true,
    tags: ['appetizer', 'stuffed', 'premium']
  },
  {
    name: 'Focaccia Bread',
    description: 'Italian flatbread with olive oil and rosemary',
    category: 'bread',
    price: 119,
    inventory: 45,
    imageUrl: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=500',
    ingredients: ['Flour', 'Olive Oil', 'Rosemary', 'Sea Salt'],
    isVegetarian: true,
    tags: ['italian', 'appetizer']
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('Existing data cleared');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);

    // Create products
    const createdProducts = await Product.create(products);
    console.log(`${createdProducts.length} products created`);

    console.log('\nSeed data created successfully!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@crewplus.com / admin123');
    console.log('Customer: john@example.com / customer123');
    console.log('Customer: jane@example.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
