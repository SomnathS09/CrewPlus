# Project Features & Architecture

## Overview
CrewPlus is a full-stack retail ordering portal built with the MERN stack (MongoDB, Express, React, Node.js). It enables customers to browse products, manage shopping carts, and place orders.

## Key Features

### ✅ Implemented Features (MVP)

#### 1. **Menu Browsing**
- Categorized product display (Pizzas, Cold Drinks, Breads)
- Product cards with images, prices, and inventory status
- Real-time inventory display
- Responsive grid layout

#### 2. **Shopping Cart Management**
- Add items to cart with quantity selection
- Session-based cart persistence
- Cart badge showing item count
- Cart modal with item details
- Subtotal calculation

#### 3. **Order Placement**
- Delivery or carryout selection
- Order validation and inventory checks
- Automatic inventory deduction
- Order confirmation with order number
- Cart clearing after successful order

#### 4. **Inventory Management**
- Real-time inventory tracking
- Automatic deduction on order placement
- Out-of-stock prevention
- Inventory validation before checkout

#### 5. **Security**
- API key authentication on all endpoints
- CORS configuration
- Input validation using express-validator
- Error handling middleware
- Environment-based security settings

#### 6. **RESTful API**
- Well-structured endpoints
- Consistent response format
- Proper HTTP status codes
- Comprehensive error messages

### 🚧 Future Enhancements (Stretch Goals)

- [ ] User authentication (JWT-based)
- [ ] Email order confirmations (SMTP integration)
- [ ] Order history for authenticated users
- [ ] Payment gateway integration
- [ ] Admin dashboard for inventory management
- [ ] Order status tracking
- [ ] Rating and review system
- [ ] Promotional codes and discounts
- [ ] Multiple delivery addresses
- [ ] Real-time order tracking

## Technical Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI framework |
| | CSS3 | Styling |
| | LocalStorage | Session management |
| **Backend** | Node.js 18+ | Runtime environment |
| | Express.js 4 | Web framework |
| | Mongoose 8 | MongoDB ODM |
| **Database** | MongoDB 6+ | NoSQL database |
| **Testing** | Jest | Unit testing |
| | Supertest | API testing |
| **DevOps** | Docker | Containerization |
| | Docker Compose | Multi-container orchestration |
| | GitHub Actions | CI/CD pipeline |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ MenuPage │  │ CartPage │  │ OrderConfirmation│  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────┐                         │
│  │ Product  │  │   API    │                         │
│  │   Card   │  │ Service  │                         │
│  └──────────┘  └──────────┘                         │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP + x-api-key
                      ▼
┌─────────────────────────────────────────────────────┐
│              Backend (Express.js)                    │
│  ┌──────────────────────────────────────────────┐   │
│  │         API Key Auth Middleware              │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
│  │  Menu    │  │  Cart    │  │   Orders     │     │
│  │  Route   │  │  Route   │  │   Route      │     │
│  └──────────┘  └──────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────┐   │
│  │         Error Handler Middleware             │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │ Mongoose ODM
                      ▼
┌─────────────────────────────────────────────────────┐
│                   MongoDB                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐      │
│  │ Products │  │  Carts   │  │   Orders     │      │
│  │Collection│  │Collection│  │ Collection   │      │
│  └──────────┘  └──────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────┘
```

### Data Flow

#### 1. Browse Menu Flow
```
User → MenuPage → API Service → GET /api/menu 
→ Backend → MongoDB → Products Collection
→ Return categorized products → Display in UI
```

#### 2. Add to Cart Flow
```
User clicks "Add to Cart" → ProductCard 
→ API Service → POST /api/cart
→ Backend validates → Find/Create Cart
→ Update items → Save to MongoDB
→ Return updated cart → Update UI badge
```

#### 3. Place Order Flow
```
User clicks "Place Order" → CartPage
→ API Service → POST /api/orders
→ Backend validates items → Check inventory
→ Deduct inventory → Create order
→ Clear cart → Return order confirmation
→ Display OrderConfirmation → Reload menu
```

## Database Schema

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,          // "Margherita Pizza"
  category: String,      // "Pizza" | "Cold Drink" | "Bread"
  price: Number,         // 299
  inventory: Number,     // 50
  imageUrl: String,      // URL to product image
  createdAt: Date,
  updatedAt: Date
}
```

### Carts Collection
```javascript
{
  _id: ObjectId,
  sessionId: String,     // Unique session identifier
  items: [{
    productId: ObjectId, // Reference to Product
    quantity: Number     // 2
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String,   // "ORD-20251222-001"
  sessionId: String,
  userId: ObjectId,      // null for guest, populated for auth
  items: [{
    productId: ObjectId, // Reference to Product
    name: String,
    quantity: Number,
    price: Number
  }],
  total: Number,         // 897
  type: String,          // "delivery" | "carryout"
  status: String,        // "confirmed" | "preparing" | etc.
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | No | Health check |
| GET | /api/menu | Yes | Get categorized products |
| POST | /api/cart | Yes | Add/update cart item |
| GET | /api/cart/:sessionId | Yes | Get cart |
| POST | /api/orders | Yes | Place order |
| GET | /api/orders | Yes | Get orders (filtered) |

## Security Features

### 1. **API Key Authentication**
- All API endpoints require `x-api-key` header
- Key validation in middleware
- 401 response for invalid/missing keys

### 2. **Input Validation**
- express-validator for request validation
- Type checking (string, number, enum)
- Required field validation
- Min/max value constraints

### 3. **CORS Protection**
- CORS middleware configured
- Can restrict to specific origins

### 4. **Error Handling**
- Centralized error handler
- Environment-based error details
- No stack traces in production
- Generic error messages

### 5. **Database Security**
- Mongoose schema validation
- No direct ObjectId manipulation
- Atomic operations for inventory

## Performance Considerations

### Frontend
- Component-based architecture
- Efficient state management
- Minimal re-renders
- LocalStorage for session persistence

### Backend
- Async/await for non-blocking operations
- Database indexes (to be added)
- Connection pooling (Mongoose default)
- Error catching at route level

### Database
- Indexed fields for faster queries
- Atomic operations for inventory
- Lean queries where possible

## Scalability

### Current Limitations
- Single server architecture
- No caching layer
- No load balancing
- No rate limiting

### Future Improvements
- Redis for session/cart caching
- Load balancer (Nginx)
- Database replication
- CDN for static assets
- Microservices architecture
- Message queue for orders
- Rate limiting middleware

## Development Workflow

1. **Local Development**
   - Backend on port 3001
   - Frontend on port 3000
   - MongoDB local or Atlas
   - Hot reload enabled

2. **Testing**
   - Jest for unit tests
   - Supertest for API tests
   - Manual testing via browser
   - Postman for API testing

3. **CI/CD**
   - GitHub Actions on push
   - Automated tests
   - Build verification
   - Deployment on success

4. **Deployment**
   - Docker Compose for easy deployment
   - Cloud-ready (Vercel + Render)
   - Environment-based configuration

## Code Organization

```
CrewPlus/
├── backend/
│   ├── config/          # Configuration files
│   │   └── db.js        # MongoDB connection
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # API key authentication
│   │   └── errorHandler.js
│   ├── models/          # Mongoose models
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/          # API routes
│   │   ├── menu.js
│   │   ├── cart.js
│   │   └── orders.js
│   ├── tests/           # Test files
│   ├── server.js        # Main server file
│   └── seed.js          # Database seeding
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── utils/       # Helper functions
└── docs/                # Documentation
```

## Best Practices Implemented

1. **Separation of Concerns** - Clear separation between routes, models, and middleware
2. **DRY Principle** - Reusable components and services
3. **Error Handling** - Comprehensive try-catch blocks
4. **Validation** - Input validation at API level
5. **Documentation** - Extensive documentation for all aspects
6. **Environment Variables** - Sensitive data in .env files
7. **Version Control** - .gitignore for sensitive files
8. **Testing** - Test structure in place
9. **Code Style** - Consistent formatting
10. **Comments** - Clear code with minimal but useful comments
