# CrewPlus - Retail Ordering Portal

A full-stack retail ordering portal for pizzas, cold drinks, and breads built for HCL Tech Hackathon 2025.

## 📋 Project Overview

This is a complete web application that enables customers to:
- Browse a menu of products (pizzas, cold drinks, breads)
- Add items to cart
- Place orders (delivery or carryout)
- Manage inventory in real-time

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB (Database)
- RESTful APIs with `x-api-key` authentication

**Frontend:**
- React.js
- CSS for styling
- Local storage for session management

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/crewplus
API_KEY=your-secret-api-key-here
NODE_ENV=development
```

5. Seed the database with sample products:
```bash
node seed.js
```

6. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_API_KEY=your-secret-api-key-here
```

**Note:** The API_KEY in frontend .env must match the API_KEY in backend .env

5. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📚 API Documentation

All API endpoints require the `x-api-key` header for authentication.

### Menu API

**GET /api/menu**
- Returns categorized list of all products
- Response includes pizzas, drinks, and breads

### Cart API

**POST /api/cart**
- Add or update items in cart
- Request body: `{ sessionId, productId, quantity }`

**GET /api/cart/:sessionId**
- Retrieve cart for a session
- Returns cart with populated product details

### Orders API

**POST /api/orders**
- Place a new order
- Request body: `{ sessionId, items, type (delivery/carryout) }`
- Deducts inventory and returns order confirmation

**GET /api/orders**
- Get orders (filtered by sessionId or userId)
- Query params: `?sessionId=xxx` or `?userId=xxx`

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Manual Testing

1. Start both backend and frontend servers
2. Open browser to `http://localhost:3000`
3. Browse products, add to cart, and place an order
4. Verify order confirmation appears

## 📁 Project Structure

```
CrewPlus/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth and error handling
│   ├── server.js        # Express server
│   ├── seed.js          # Database seeding script
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── utils/       # Helper functions
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── docs/
│   └── srs.md          # Software Requirements Specification
└── README.md
```

## 🔒 Security

- API endpoints are secured with `x-api-key` header authentication
- CORS enabled for frontend origin
- Input validation on all endpoints
- Inventory checks to prevent overselling

## 📝 Features Implemented

### MVP Features (Completed)
- ✅ Menu browsing with categorized products
- ✅ Shopping cart management
- ✅ Order placement (delivery/carryout)
- ✅ Real-time inventory management
- ✅ API key authentication
- ✅ Responsive design

### Stretch Goals (Future)
- [ ] User authentication (JWT)
- [ ] Email order confirmations
- [ ] Order history for authenticated users
- [ ] Payment integration

## 📄 Documentation
- [Software Requirements Specification (SRS)](./docs/srs.md)

## 👥 Authors

Team Crew+

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- HCL Tech Hackathon 2025
- Design specifications from SRS document