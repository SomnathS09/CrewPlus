require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  // Pizzas
  {
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 299,
    inventory: 50,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    name: 'Pepperoni Pizza',
    category: 'Pizza',
    price: 399,
    inventory: 45,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    name: 'Veggie Supreme Pizza',
    category: 'Pizza',
    price: 349,
    inventory: 40,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    name: 'BBQ Chicken Pizza',
    category: 'Pizza',
    price: 449,
    inventory: 35,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    name: 'Hawaiian Pizza',
    category: 'Pizza',
    price: 379,
    inventory: 30,
    imageUrl: 'https://via.placeholder.com/150'
  },
  // Cold Drinks
  {
    name: 'Coca Cola',
    category: 'Cold Drink',
    price: 50,
    inventory: 100,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    name: 'Pepsi',
    category: 'Cold Drink',
    price: 50,
    inventory: 100,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    name: 'Sprite',
    category: 'Cold Drink',
    price: 50,
    inventory: 100,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    name: 'Fanta Orange',
    category: 'Cold Drink',
    price: 50,
    inventory: 100,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    name: 'Mountain Dew',
    category: 'Cold Drink',
    price: 50,
    inventory: 100,
    imageUrl: 'https://via.placeholder.com/150'
  },
  // Breads
  {
    name: 'Garlic Bread',
    category: 'Bread',
    price: 99,
    inventory: 60,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    name: 'Cheese Bread',
    category: 'Bread',
    price: 129,
    inventory: 55,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    name: 'Breadsticks',
    category: 'Bread',
    price: 79,
    inventory: 70,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    name: 'Stuffed Bread',
    category: 'Bread',
    price: 149,
    inventory: 40,
    imageUrl: 'https://via.placeholder.com/150'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared');

    // Insert new products
    await Product.insertMany(products);
    console.log('Products seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
