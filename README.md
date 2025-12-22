# CrewPlus - Pizza Ordering Portal

<p align="center">
  <img src="docs/images/logo.png" alt="CrewPlus Logo" width="200"/>
</p>

**HCL Tech Hackathon 2025**

A full-stack pizza ordering system built with React, Node.js/Express, and MongoDB. Features include real-time order tracking, food customization, coupon system, inventory management, and comprehensive admin dashboard.

### Documentation
- [Software Requirements Specification (SRS)](/docs/srs.md)
- [Technical Documentation](/docs/technical.md)

---

## Features

### Customer Features
- **Menu Browsing** - Browse pizzas, drinks, and sides with filtering options
- **Food Customization** - Customize pizzas with crusts, sauces, cheese, and toppings
- **Shopping Cart** - Guest and authenticated cart with session persistence
- **Order Placement** - Delivery or carryout with multiple payment options
- **Order Tracking** - Real-time order status tracking
- **Coupon System** - Apply discount codes at checkout
- **Order History** - View past orders and reorder

### Admin Features
- **Analytics Dashboard** - Revenue, orders, and popular items charts
- **Order Management** - Process orders through workflow states
- **Product Management** - CRUD operations for menu items
- **Inventory Control** - Low stock alerts and inventory updates
- **User Management** - Create and manage user accounts
- **Coupon Management** - Create and manage discount coupons
- **Customization Management** - Manage pizza customization options

### Technical Features
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Customer and Admin roles
- **Email Notifications** - Order confirmation and status updates via SMTP
- **Automated Testing** - Comprehensive Jest test suite
- **CI/CD Pipeline** - GitHub Actions for automated testing

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| React Router v6 | Client-side routing |
| Context API | State management |
| Axios | HTTP client |
| Recharts | Data visualization |
| React Icons | Icon library |
| React Hot Toast | Toast notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Nodemailer | Email service |
| Jest + Supertest | Testing |

### DevOps
| Technology | Purpose |
|------------|---------|
| GitHub Actions | CI/CD pipeline |
| Vercel | Deployment |
| MongoDB Atlas | Cloud database |

---

## Project Structure

```
CrewPlus/
├── client/                     # React Frontend
│   ├── public/
│   └── src/
│       ├── components/         # Reusable components
│       │   ├── common/         # Loading, ProtectedRoute
│       │   ├── layout/         # Navbar, Footer
│       │   └── menu/           # ProductCard, ProductList
│       ├── context/            # React Context providers
│       │   ├── AuthContext.js  # Authentication state
│       │   └── CartContext.js  # Shopping cart state
│       ├── pages/              # Page components
│       │   ├── admin/          # Admin pages
│       │   ├── auth/           # Login, Register
│       │   └── customer/       # Orders, Profile
│       ├── services/           # API services
│       └── utils/              # Utility functions
│
├── server/                     # Express Backend
│   ├── __tests__/              # Jest test files
│   └── src/
│       ├── config/             # Database, constants
│       ├── controllers/        # Route handlers
│       ├── middleware/         # Auth, error handling
│       ├── models/             # Mongoose schemas
│       ├── routes/             # API routes
│       ├── seeds/              # Seed data
│       ├── services/           # Email service
│       ├── utils/              # ApiError, ApiResponse
│       └── validators/         # Request validators
│
├── .github/workflows/          # CI/CD configuration
└── docs/                       # Documentation
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- SMTP credentials (optional, for email notifications)

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@crewplus.com
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

---

## Demo Accounts

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@crewplus.com | admin123 |
| Customer | john@example.com | customer123 |
| Customer | jane@example.com | customer123 |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/password` | Change password | Private |
| GET | `/api/auth/users` | List all users | Admin |
| POST | `/api/auth/users` | Create new user | Admin |

### Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | List products | Public |
| GET | `/api/products/menu` | Get menu by category | Public |
| GET | `/api/products/:id` | Get product details | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| GET | `/api/products/admin/low-stock` | Get low stock items | Admin |

### Cart
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/cart` | Get cart | Public* |
| POST | `/api/cart/items` | Add item to cart | Public* |
| PUT | `/api/cart/items/:itemId` | Update quantity | Public* |
| DELETE | `/api/cart/items/:itemId` | Remove item | Public* |
| DELETE | `/api/cart` | Clear cart | Public* |
| POST | `/api/cart/merge` | Merge guest cart | Private |

*Requires session ID header for guest users

### Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/orders` | Create order | Public* |
| GET | `/api/orders/my-orders` | Get user's orders | Private |
| GET | `/api/orders/:id` | Get order details | Private |
| GET | `/api/orders/track/:orderNumber` | Track order | Public |
| PUT | `/api/orders/:id/cancel` | Cancel order | Private |
| GET | `/api/orders` | List all orders | Admin |
| PUT | `/api/orders/:id/status` | Update status | Admin |
| GET | `/api/orders/admin/analytics` | Get analytics | Admin |

### Coupons
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/coupons/validate` | Validate coupon | Public |
| GET | `/api/coupons` | List all coupons | Admin |
| POST | `/api/coupons` | Create coupon | Admin |
| PUT | `/api/coupons/:id` | Update coupon | Admin |
| DELETE | `/api/coupons/:id` | Delete coupon | Admin |
| PUT | `/api/coupons/:id/toggle` | Toggle status | Admin |

### Customizations
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/customizations` | List customizations | Public |
| GET | `/api/customizations/:id` | Get customization | Public |
| POST | `/api/customizations` | Create customization | Admin |
| PUT | `/api/customizations/:id` | Update customization | Admin |
| DELETE | `/api/customizations/:id` | Delete customization | Admin |
| PUT | `/api/customizations/:id/toggle` | Toggle availability | Admin |

---

## Scripts

### Server
| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run seed` | Seed database with sample data |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

### Client
| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |

---

## Testing

The project includes comprehensive API tests using Jest and Supertest with MongoDB Memory Server for test isolation.

### Running Tests

1. **Navigate to the server directory:**
```bash
cd server
```

2. **Run all tests once:**
```bash
npm test
```

3. **Run tests with coverage report:**
```bash
npm run test:coverage
```

4. **Run tests in watch mode** (re-runs on file changes):
```bash
npm run test:watch
```

### Test Coverage Report

After running `npm run test:coverage`, you'll see a coverage report showing:
- **Statements** - % of code statements executed
- **Branches** - % of conditional branches tested
- **Functions** - % of functions called
- **Lines** - % of lines executed

A detailed HTML report is generated at `server/coverage/lcov-report/index.html`.

### Test Suites

| Test File | Description | Endpoints Tested |
|-----------|-------------|------------------|
| `auth.test.js` | Authentication | Register, Login, Profile, Password |
| `products.test.js` | Product CRUD | Create, Read, Update, Delete, Inventory |
| `cart.test.js` | Shopping Cart | Add, Update, Remove, Clear, Merge |
| `orders.test.js` | Order Management | Create, Track, Cancel, Status Updates |
| `coupons.test.js` | Coupon System | Create, Validate, Toggle, Delete |
| `customizations.test.js` | Customizations | Create, Update, Toggle, Delete |

### Test Configuration

Tests use:
- **Jest** - Test runner and assertion library
- **Supertest** - HTTP request testing
- **MongoDB Memory Server** - In-memory database for test isolation

Each test suite runs in isolation with a fresh database state.

---

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

1. **Lint** - Code linting for client and server
2. **Test Server** - Run backend tests with MongoDB
3. **Test Client** - Run frontend tests
4. **Build Check** - Verify production build succeeds

Vercel handles automatic deployments on push to main branch.

---

## Environment Variables

### Server (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port (default: 5000) | No |
| NODE_ENV | Environment (development/production) | No |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret key for JWT tokens | Yes |
| JWT_EXPIRE | Token expiration (default: 7d) | No |
| CLIENT_URL | Frontend URL for CORS | Yes |
| SMTP_HOST | SMTP server host | No |
| SMTP_PORT | SMTP server port | No |
| SMTP_USER | SMTP username | No |
| SMTP_PASS | SMTP password | No |
| FROM_EMAIL | Sender email address | No |

### Client (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| REACT_APP_API_URL | Backend API URL | No |

---

## Screenshots

### Customer View
- Home page with featured items
- Menu page with category filters
- Pizza customization modal
- Shopping cart with customizations
- Checkout with coupon support
- Order tracking page

### Admin Dashboard
- Analytics with charts
- Order management with status workflow
- Product management
- Inventory control
- User management
- Coupon management
- Customization management

---

## License

ISC

---

## Author

**Crew+** - HCL Tech Hackathon 2025
