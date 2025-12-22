# CrewPlus - Pizza Ordering Portal

HCL Tech Hackathon 2025

A full-stack pizza ordering system built with React, Node.js/Express, and MongoDB.

### Documentation
- [SRS](./docs/srs.md)

## Features

### User Roles
- **Guest**: Browse menu and add items to cart
- **Customer**: Place orders, view order history, manage profile
- **Admin**: Dashboard analytics, manage orders, products, and inventory

### Core Features
- User authentication (JWT-based)
- Role-based access control
- Menu browsing with filtering
- Shopping cart management
- Order placement (delivery/carryout)
- Real-time inventory management
- Order tracking
- Admin analytics dashboard

## Tech Stack

### Frontend
- React 18
- React Router v6
- Context API (State Management)
- Axios (HTTP Client)
- Recharts (Charts)
- React Icons
- React Hot Toast

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Express Validator
- bcryptjs

## Project Structure

```
CrewPlus/
├── client/                 # React Frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── context/        # React Context providers
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── utils/          # Utility functions
│
├── server/                 # Express Backend
│   └── src/
│       ├── config/         # Configuration files
│       ├── controllers/    # Route controllers
│       ├── middleware/     # Custom middleware
│       ├── models/         # Mongoose models
│       ├── routes/         # API routes
│       ├── seeds/          # Seed data
│       ├── utils/          # Utility functions
│       └── validators/     # Request validators
│
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI="mongodb+srv://hcl:hcl0@cluster0.qckvosa.mongodb.net/?appName=Cluster0"
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
API_KEY=your_api_key
CLIENT_URL=http://localhost:3000
```

4. Seed the database:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

## Demo Accounts

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@crewplus.com | admin123 |
| Customer | john@example.com | customer123 |
| Customer | jane@example.com | customer123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Products
- `GET /api/products` - List products
- `GET /api/products/menu` - Get menu grouped by category
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:itemId` - Update item quantity
- `DELETE /api/cart/items/:itemId` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/track/:orderNumber` - Track order
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders` - List all orders (Admin)
- `PUT /api/orders/:id/status` - Update status (Admin)
- `GET /api/orders/admin/analytics` - Get analytics (Admin)

## Scripts

### Server
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Client
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Author

**Crew+** - December 2025
