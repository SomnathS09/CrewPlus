# CrewPlus - Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Design](#database-design)
3. [Authentication Flow](#authentication-flow)
4. [Order Processing Workflow](#order-processing-workflow)
5. [Cart Management](#cart-management)
6. [Coupon System](#coupon-system)
7. [Inventory Management](#inventory-management)
8. [Food Customization](#food-customization)
9. [Email Notification System](#email-notification-system)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [API Design Patterns](#api-design-patterns)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React)                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Pages     │  │ Components  │  │   Context   │  │     Services        │ │
│  │  - Home     │  │  - Navbar   │  │  - Auth     │  │  - API (axios)      │ │
│  │  - Menu     │  │  - Footer   │  │  - Cart     │  │  - Session          │ │
│  │  - Cart     │  │  - Product  │  │             │  │                     │ │
│  │  - Checkout │  │    Card     │  │             │  │                     │ │
│  │  - Admin/*  │  │  - Loading  │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────┬───────────────────────────────────┘
                                          │ HTTP/HTTPS (REST API)
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVER (Express.js)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Routes    │  │ Controllers │  │ Middleware  │  │     Services        │ │
│  │  - auth     │  │  - auth     │  │  - auth     │  │  - emailService     │ │
│  │  - products │  │  - products │  │  - error    │  │                     │ │
│  │  - cart     │  │  - cart     │  │  - validate │  │                     │ │
│  │  - orders   │  │  - orders   │  │             │  │                     │ │
│  │  - coupons  │  │  - coupons  │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                          │                                   │
│  ┌───────────────────────────────────────┴──────────────────────────────┐   │
│  │                           Models (Mongoose)                           │   │
│  │   User  │  Product  │  Cart  │  Order  │  Coupon  │  Customization   │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────┬───────────────────────────────────┘
                                          │ MongoDB Driver
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (MongoDB Atlas)                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  users   │ │ products │ │  carts   │ │  orders  │ │  customizations  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│                            ┌──────────┐                                      │
│                            │ coupons  │                                      │
│                            └──────────┘                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Diagram

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│     Browser      │     │   React App      │     │   Express API    │
│                  │     │                  │     │                  │
│  User Action     │────▶│  Event Handler   │────▶│   Route Handler  │
│                  │     │        │         │     │        │         │
│                  │     │        ▼         │     │        ▼         │
│                  │     │  Context Update  │     │   Controller     │
│                  │     │        │         │     │        │         │
│                  │     │        ▼         │     │        ▼         │
│  UI Update      ◀────│  Component        │◀────│   Response       │
│                  │     │  Re-render       │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐        │
│  │    USER      │         │   PRODUCT    │         │CUSTOMIZATION │        │
│  ├──────────────┤         ├──────────────┤         ├──────────────┤        │
│  │ _id          │         │ _id          │         │ _id          │        │
│  │ name         │         │ name         │         │ name         │        │
│  │ email        │         │ description  │         │ type         │        │
│  │ password     │         │ price        │         │ price        │        │
│  │ phone        │         │ prices{}     │         │ isVegetarian │        │
│  │ role         │         │ category     │         │ isAvailable  │        │
│  │ address{}    │         │ imageUrl     │         │ applicable   │        │
│  │ isActive     │         │ isVegetarian │         │   Categories │        │
│  └──────┬───────┘         │ isSpicy      │         └──────────────┘        │
│         │                 │ isAvailable  │                                  │
│         │                 │ inventory    │                                  │
│         │                 └──────┬───────┘                                  │
│         │                        │                                          │
│         │    ┌───────────────────┼───────────────────┐                     │
│         │    │                   │                   │                     │
│         ▼    ▼                   ▼                   ▼                     │
│  ┌──────────────┐         ┌──────────────┐   ┌──────────────┐              │
│  │    CART      │         │    ORDER     │   │   COUPON     │              │
│  ├──────────────┤         ├──────────────┤   ├──────────────┤              │
│  │ _id          │         │ _id          │   │ _id          │              │
│  │ user (ref)   │         │ orderNumber  │   │ code         │              │
│  │ sessionId    │         │ user (ref)   │   │ type         │              │
│  │ items[]      │         │ items[]      │   │ value        │              │
│  │  - product   │         │  - product   │   │ minOrderAmt  │              │
│  │  - quantity  │         │  - name      │   │ maxDiscount  │              │
│  │  - size      │         │  - quantity  │   │ validFrom    │              │
│  │  - price     │         │  - size      │   │ validUntil   │              │
│  │  - customs[] │         │  - price     │   │ usageLimit   │              │
│  │ subtotal     │         │  - customs[] │   │ usedCount    │              │
│  │ tax          │         │ subtotal     │   │ usedBy[]     │              │
│  │ total        │         │ tax          │   │ isActive     │              │
│  └──────────────┘         │ deliveryFee  │   └──────────────┘              │
│                           │ discount     │                                  │
│                           │ couponCode   │                                  │
│                           │ total        │                                  │
│                           │ type         │                                  │
│                           │ status       │                                  │
│                           │ customerInfo │                                  │
│                           │ deliveryAddr │                                  │
│                           │ paymentMethod│                                  │
│                           └──────────────┘                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

RELATIONSHIPS:
  User ──1:N──▶ Order (user places orders)
  User ──1:1──▶ Cart (user has one cart)
  Product ──M:N──▶ Cart.items (products in cart)
  Product ──M:N──▶ Order.items (products in order)
  Customization ──M:N──▶ Cart.items.customizations
  Customization ──M:N──▶ Order.items.customizations
  Coupon ──1:N──▶ Order (coupon applied to orders)
```

### Collection Schemas

#### User Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (required),
  role: String (enum: ['customer', 'admin']),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### Product Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  price: Number (required),
  prices: {
    small: Number,
    medium: Number,
    large: Number,
    extra_large: Number
  },
  category: String (enum: ['pizza', 'drink', 'side', 'dessert', 'bread']),
  imageUrl: String,
  isVegetarian: Boolean,
  isSpicy: Boolean,
  ingredients: [String],
  isAvailable: Boolean (default: true),
  inventory: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

#### Order Schema
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique, auto-generated),
  user: ObjectId (ref: User),
  sessionId: String,
  items: [{
    product: ObjectId (ref: Product),
    name: String,
    quantity: Number,
    size: String,
    price: Number,
    customizations: [{
      customization: ObjectId (ref: Customization),
      name: String,
      price: Number
    }],
    customizationTotal: Number,
    notes: String
  }],
  subtotal: Number,
  tax: Number,
  deliveryFee: Number,
  discount: Number,
  couponCode: String,
  total: Number,
  type: String (enum: ['delivery', 'carryout']),
  status: String (enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  paymentMethod: String (enum: ['cash', 'card', 'online']),
  paymentStatus: String (enum: ['pending', 'paid', 'failed', 'refunded']),
  notes: String,
  estimatedDelivery: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication Flow

### JWT Authentication Sequence

```
┌──────────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐
│  Client  │          │  Server  │          │   Auth   │          │    DB    │
│          │          │          │          │Middleware│          │          │
└────┬─────┘          └────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │                     │
     │  POST /auth/login   │                     │                     │
     │  {email, password}  │                     │                     │
     │────────────────────▶│                     │                     │
     │                     │                     │                     │
     │                     │  Find user by email │                     │
     │                     │─────────────────────┼────────────────────▶│
     │                     │                     │                     │
     │                     │  User document      │                     │
     │                     │◀────────────────────┼─────────────────────│
     │                     │                     │                     │
     │                     │  Compare password   │                     │
     │                     │  (bcrypt)           │                     │
     │                     │                     │                     │
     │                     │  Generate JWT       │                     │
     │                     │  (jsonwebtoken)     │                     │
     │                     │                     │                     │
     │  {token, user}      │                     │                     │
     │◀────────────────────│                     │                     │
     │                     │                     │                     │
     │  Store token in     │                     │                     │
     │  localStorage       │                     │                     │
     │                     │                     │                     │
     │  GET /protected     │                     │                     │
     │  Authorization:     │                     │                     │
     │  Bearer <token>     │                     │                     │
     │────────────────────▶│                     │                     │
     │                     │                     │                     │
     │                     │  Verify token       │                     │
     │                     │─────────────────────▶                     │
     │                     │                     │                     │
     │                     │  Get user from DB   │                     │
     │                     │                     │────────────────────▶│
     │                     │                     │                     │
     │                     │  Attach user to req │◀────────────────────│
     │                     │◀─────────────────────                     │
     │                     │                     │                     │
     │  Protected data     │                     │                     │
     │◀────────────────────│                     │                     │
     │                     │                     │                     │
```

### Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────────┐
│                     ACCESS CONTROL MATRIX                        │
├─────────────────────────┬──────────┬──────────┬─────────────────┤
│        Resource         │  Guest   │ Customer │     Admin       │
├─────────────────────────┼──────────┼──────────┼─────────────────┤
│ View Menu               │    ✓     │    ✓     │       ✓         │
│ View Product Details    │    ✓     │    ✓     │       ✓         │
│ Add to Cart             │    ✓     │    ✓     │       ✗         │
│ Place Order             │    ✓     │    ✓     │       ✗         │
│ Track Order             │    ✓     │    ✓     │       ✓         │
│ View Order History      │    ✗     │    ✓     │       ✓         │
│ Update Profile          │    ✗     │    ✓     │       ✓         │
│ View Dashboard          │    ✗     │    ✗     │       ✓         │
│ Manage Products         │    ✗     │    ✗     │       ✓         │
│ Manage Orders           │    ✗     │    ✗     │       ✓         │
│ Manage Users            │    ✗     │    ✗     │       ✓         │
│ Manage Coupons          │    ✗     │    ✗     │       ✓         │
│ Manage Customizations   │    ✗     │    ✗     │       ✓         │
└─────────────────────────┴──────────┴──────────┴─────────────────┘
```

---

## Order Processing Workflow

### Order State Machine

```
                              ┌─────────────────────────────────────┐
                              │                                     │
                              ▼                                     │
┌─────────┐  Order    ┌───────────┐  Confirm   ┌───────────┐       │
│  Cart   │──Placed──▶│  PENDING  │───────────▶│ CONFIRMED │       │
└─────────┘           └─────┬─────┘            └─────┬─────┘       │
                            │                        │              │
                            │ Cancel                 │ Start        │
                            │                        │ Preparing    │
                            ▼                        ▼              │
                      ┌───────────┐           ┌───────────┐         │
                      │ CANCELLED │           │ PREPARING │         │
                      └───────────┘           └─────┬─────┘         │
                            ▲                       │               │
                            │                       │ Mark Ready    │
                            │ Cancel                │               │
                            │                       ▼               │
                            │                 ┌───────────┐         │
                            └─────────────────│   READY   │         │
                                              └─────┬─────┘         │
                                                    │               │
                                                    │ Deliver/      │
                                                    │ Pickup        │
                                                    ▼               │
                                              ┌───────────┐         │
                                              │ DELIVERED │─────────┘
                                              └───────────┘   (End)


STATUS TRANSITIONS:
  pending   → confirmed, cancelled
  confirmed → preparing, cancelled
  preparing → ready, cancelled
  ready     → delivered
  delivered → (terminal state)
  cancelled → (terminal state)
```

### Order Creation Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │   Cart   │     │  Order   │     │ Product  │
│          │     │Controller│     │Controller│     │  Model   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ POST /orders   │                │                │
     │ {type, info}   │                │                │
     │────────────────┼───────────────▶│                │
     │                │                │                │
     │                │  Get cart      │                │
     │                │◀───────────────│                │
     │                │                │                │
     │                │  Cart data     │                │
     │                │───────────────▶│                │
     │                │                │                │
     │                │                │ Validate stock │
     │                │                │───────────────▶│
     │                │                │                │
     │                │                │ Stock OK       │
     │                │                │◀───────────────│
     │                │                │                │
     │                │                │ Apply coupon   │
     │                │                │ (if provided)  │
     │                │                │                │
     │                │                │ Create order   │
     │                │                │───────────────▶│
     │                │                │                │
     │                │                │ Decrement      │
     │                │                │ inventory      │
     │                │                │───────────────▶│
     │                │                │                │
     │                │ Clear cart     │                │
     │                │◀───────────────│                │
     │                │                │                │
     │  Order created │                │                │
     │◀───────────────┼────────────────│                │
     │                │                │                │
     │                │                │ Send email     │
     │                │                │ (async)        │
     │                │                │                │
```

---

## Cart Management

### Cart Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CART SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────┐                │
│  │   Guest Cart    │         │    User Cart    │                │
│  │  (sessionId)    │         │    (userId)     │                │
│  └────────┬────────┘         └────────┬────────┘                │
│           │                           │                          │
│           │      ┌────────────────────┤                          │
│           │      │                    │                          │
│           ▼      ▼                    ▼                          │
│  ┌─────────────────────────────────────────────────────┐        │
│  │                    Cart Model                        │        │
│  │  ┌─────────────────────────────────────────────┐    │        │
│  │  │ items: [{                                    │    │        │
│  │  │   product: ObjectId,                         │    │        │
│  │  │   quantity: Number,                          │    │        │
│  │  │   size: String,                              │    │        │
│  │  │   price: Number,                             │    │        │
│  │  │   customizations: [{                         │    │        │
│  │  │     customization: ObjectId,                 │    │        │
│  │  │     name: String,                            │    │        │
│  │  │     price: Number                            │    │        │
│  │  │   }],                                        │    │        │
│  │  │   customizationTotal: Number,                │    │        │
│  │  │   notes: String                              │    │        │
│  │  │ }]                                           │    │        │
│  │  └─────────────────────────────────────────────┘    │        │
│  │                                                      │        │
│  │  Pre-save Hook:                                      │        │
│  │  ┌─────────────────────────────────────────────┐    │        │
│  │  │ subtotal = Σ(price + customTotal) × qty     │    │        │
│  │  │ tax = subtotal × 0.10                        │    │        │
│  │  │ total = subtotal + tax                       │    │        │
│  │  └─────────────────────────────────────────────┘    │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Cart Merge Flow (Login)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │   Auth   │     │   Cart   │     │    DB    │
│          │     │Controller│     │Controller│     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ POST /login    │                │                │
     │────────────────▶                │                │
     │                │                │                │
     │ Login success  │                │                │
     │ + token        │                │                │
     │◀────────────────                │                │
     │                │                │                │
     │ POST /cart/merge               │                │
     │ {sessionId}    │                │                │
     │─────────────────────────────────▶                │
     │                │                │                │
     │                │                │ Find guest cart│
     │                │                │───────────────▶│
     │                │                │                │
     │                │                │ Guest cart     │
     │                │                │◀───────────────│
     │                │                │                │
     │                │                │ Find user cart │
     │                │                │───────────────▶│
     │                │                │                │
     │                │                │ User cart      │
     │                │                │◀───────────────│
     │                │                │                │
     │                │                │ Merge items    │
     │                │                │ (combine qty   │
     │                │                │  if same item) │
     │                │                │                │
     │                │                │ Delete guest   │
     │                │                │ cart           │
     │                │                │───────────────▶│
     │                │                │                │
     │ Merged cart    │                │                │
     │◀─────────────────────────────────                │
     │                │                │                │
```

---

## Coupon System

### Coupon Validation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    COUPON VALIDATION PROCESS                     │
└─────────────────────────────────────────────────────────────────┘

        Input: couponCode, subtotal
                    │
                    ▼
        ┌───────────────────────┐
        │  Find coupon by code  │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐      ┌─────────────────┐
        │   Coupon exists?      │──No─▶│ 404: Not Found  │
        └───────────┬───────────┘      └─────────────────┘
                    │ Yes
                    ▼
        ┌───────────────────────┐      ┌─────────────────┐
        │   isActive = true?    │──No─▶│ 400: Inactive   │
        └───────────┬───────────┘      └─────────────────┘
                    │ Yes
                    ▼
        ┌───────────────────────┐      ┌─────────────────┐
        │ Within valid dates?   │──No─▶│ 400: Expired    │
        │ (validFrom ≤ now ≤    │      └─────────────────┘
        │  validUntil)          │
        └───────────┬───────────┘
                    │ Yes
                    ▼
        ┌───────────────────────┐      ┌─────────────────┐
        │ Under usage limit?    │──No─▶│ 400: Limit      │
        │ (usedCount < limit)   │      │     reached     │
        └───────────┬───────────┘      └─────────────────┘
                    │ Yes
                    ▼
        ┌───────────────────────┐      ┌─────────────────┐
        │ Meets min order?      │──No─▶│ 400: Min order  │
        │ (subtotal ≥ minOrder) │      │     not met     │
        └───────────┬───────────┘      └─────────────────┘
                    │ Yes
                    ▼
        ┌───────────────────────────────┐
        │     Calculate Discount         │
        │  ┌─────────────────────────┐  │
        │  │ if type == 'percentage' │  │
        │  │   discount = subtotal   │  │
        │  │              × value/100│  │
        │  │ else                    │  │
        │  │   discount = value      │  │
        │  │                         │  │
        │  │ if discount > maxDisc   │  │
        │  │   discount = maxDisc    │  │
        │  └─────────────────────────┘  │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Return: {coupon, discount}   │
        └───────────────────────────────┘
```

---

## Inventory Management

### Inventory System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVENTORY SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Admin Dashboard                       │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌────────────┐  │    │
│  │  │ Stats Cards   │  │ Low Stock     │  │ Inventory  │  │    │
│  │  │ - Total       │  │ Alert         │  │ Table      │  │    │
│  │  │ - In Stock    │  │ - Items < 10  │  │ - Search   │  │    │
│  │  │ - Low Stock   │  │ - Quick +20   │  │ - Filter   │  │    │
│  │  │ - Out of Stock│  │               │  │ - Actions  │  │    │
│  │  └───────────────┘  └───────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Operations:                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ADD      : inventory += quantity                        │    │
│  │  SUBTRACT : inventory -= quantity (if sufficient)        │    │
│  │  SET      : inventory = quantity                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Stock Status:                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  IN STOCK     : inventory > threshold (default: 10)      │    │
│  │  LOW STOCK    : 0 < inventory <= threshold               │    │
│  │  OUT OF STOCK : inventory = 0                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Auto-behaviors:                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  - Out of stock items hidden from menu                   │    │
│  │  - "Add to Cart" disabled for out of stock               │    │
│  │  - Inventory deducted on order placement                 │    │
│  │  - Inventory restored on order cancellation              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Inventory Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Order       │     │   Product    │     │   Inventory  │
│  Created     │────▶│   Model      │────▶│   Deducted   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            │ inventory == 0
                            ▼
                     ┌──────────────┐
                     │  isAvailable │
                     │  = false     │
                     │  (hidden)    │
                     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Order       │     │   Product    │     │   Inventory  │
│  Cancelled   │────▶│   Model      │────▶│   Restored   │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Food Customization

### Customization Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   CUSTOMIZATION SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Customization Types:                                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  CRUST  │ │  SAUCE  │ │ CHEESE  │ │ TOPPING │ │  EXTRA  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
│       │           │           │           │           │          │
│       └───────────┴───────────┴─────┬─────┴───────────┘          │
│                                     │                             │
│                                     ▼                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Customization Model                         │    │
│  │  {                                                       │    │
│  │    name: String,                                         │    │
│  │    type: enum ['crust','sauce','cheese','topping',      │    │
│  │           'extra'],                                      │    │
│  │    price: Number (additional cost),                      │    │
│  │    isVegetarian: Boolean,                                │    │
│  │    isAvailable: Boolean,                                 │    │
│  │    applicableCategories: ['pizza', 'bread', 'drink']    │    │
│  │  }                                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Flow:                                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │   Menu Page          Customize Modal        Cart         │    │
│  │   ┌─────────┐        ┌─────────────┐     ┌─────────┐    │    │
│  │   │ Pizza   │──Add──▶│ Select:     │     │ Items:  │    │    │
│  │   │ Card    │        │  □ Crust    │     │  Pizza  │    │    │
│  │   └─────────┘        │  □ Sauce    │──▶  │  +Custs │    │    │
│  │                      │  □ Cheese   │     │  = Total│    │    │
│  │                      │  □ Toppings │     └─────────┘    │    │
│  │                      └─────────────┘                     │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Price Calculation

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRICE CALCULATION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Item Total = (Base Price + Customization Total) × Quantity      │
│                                                                  │
│  Example:                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Medium Margherita Pizza          ₹299                   │    │
│  │  + Extra Cheese                   ₹50                    │    │
│  │  + Pepperoni                      ₹70                    │    │
│  │  + Thin Crust                     ₹0                     │    │
│  │  ─────────────────────────────────────                   │    │
│  │  Customization Total:             ₹120                   │    │
│  │                                                          │    │
│  │  Unit Price: ₹299 + ₹120 = ₹419                         │    │
│  │  Quantity: 2                                             │    │
│  │  ─────────────────────────────────────                   │    │
│  │  Item Total: ₹419 × 2 = ₹838                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Cart Total:                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Subtotal: Σ(Item Totals)                                │    │
│  │  Tax (10%): Subtotal × 0.10                              │    │
│  │  Delivery Fee: ₹50 (if delivery)                         │    │
│  │  Discount: -Coupon Discount                              │    │
│  │  ─────────────────────────────────────                   │    │
│  │  Grand Total: Subtotal + Tax + Delivery - Discount       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Email Notification System

### Email Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL SERVICE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    emailService.js                       │    │
│  │                                                          │    │
│  │  ┌───────────────────┐    ┌───────────────────┐         │    │
│  │  │ createTransporter │───▶│    nodemailer     │         │    │
│  │  │ (SMTP config)     │    │    transport      │         │    │
│  │  └───────────────────┘    └─────────┬─────────┘         │    │
│  │                                     │                    │    │
│  │  ┌───────────────────┐              │                    │    │
│  │  │ sendOrderConfirm  │◀─────────────┘                    │    │
│  │  │ ationEmail()      │                                   │    │
│  │  └─────────┬─────────┘                                   │    │
│  │            │                                             │    │
│  │            ▼                                             │    │
│  │  ┌───────────────────┐                                   │    │
│  │  │ HTML Email        │                                   │    │
│  │  │ Template:         │                                   │    │
│  │  │ - Order number    │                                   │    │
│  │  │ - Items list      │                                   │    │
│  │  │ - Total amount    │                                   │    │
│  │  │ - Delivery info   │                                   │    │
│  │  │ - Status          │                                   │    │
│  │  └───────────────────┘                                   │    │
│  │                                                          │    │
│  │  ┌───────────────────┐                                   │    │
│  │  │ sendOrderStatus   │                                   │    │
│  │  │ UpdateEmail()     │                                   │    │
│  │  └───────────────────┘                                   │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Trigger Points:                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ Order Created   │───▶│ Confirmation    │                     │
│  └─────────────────┘    │ Email           │                     │
│                         └─────────────────┘                     │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ Status Updated  │───▶│ Status Update   │                     │
│  │ (by admin)      │    │ Email           │                     │
│  └─────────────────┘    └─────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Trigger: Push to main/develop OR Pull Request                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                         LINT                             │    │
│  │  ┌───────────────┐        ┌───────────────┐             │    │
│  │  │ Client Lint   │        │ Server Lint   │             │    │
│  │  │ (npm run lint)│        │ (npm run lint)│             │    │
│  │  └───────┬───────┘        └───────┬───────┘             │    │
│  │          └──────────┬─────────────┘                      │    │
│  └─────────────────────┼────────────────────────────────────┘    │
│                        │ Pass                                    │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    TEST (Parallel)                       │    │
│  │                                                          │    │
│  │  ┌───────────────────────┐  ┌───────────────────────┐   │    │
│  │  │    TEST-SERVER        │  │    TEST-CLIENT        │   │    │
│  │  │                       │  │                       │   │    │
│  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │   │    │
│  │  │  │ MongoDB Service │  │  │  │ npm ci          │  │   │    │
│  │  │  │ (docker)        │  │  │  │                 │  │   │    │
│  │  │  └─────────────────┘  │  │  │ npm test        │  │   │    │
│  │  │                       │  │  │ --coverage      │  │   │    │
│  │  │  npm ci               │  │  │                 │  │   │    │
│  │  │  npm test --coverage  │  │  └─────────────────┘  │   │    │
│  │  │                       │  │                       │   │    │
│  │  │  Upload to Codecov    │  │  Upload to Codecov    │   │    │
│  │  └───────────┬───────────┘  └───────────┬───────────┘   │    │
│  │              └──────────────────────────┘                │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            │ Pass                                │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    BUILD-CHECK                           │    │
│  │                                                          │    │
│  │  npm ci                                                  │    │
│  │  npm run build                                           │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │ Pass                                │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    VERCEL DEPLOY                         │    │
│  │            (Automatic on push to main)                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Design Patterns

### Response Format

```javascript
// Success Response
{
  "success": true,
  "message": "Operation successful",  // Optional
  "data": {
    // Response payload
  }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": [                         // Optional validation errors
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Request                                                         │
│     │                                                            │
│     ▼                                                            │
│  ┌─────────────────┐                                            │
│  │ Route Handler   │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ asyncHandler()  │───▶│ Controller      │                     │
│  │ (try/catch)     │    │ Logic           │                     │
│  └────────┬────────┘    └────────┬────────┘                     │
│           │                      │                               │
│           │  Error thrown        │ Success                       │
│           ▼                      ▼                               │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ ApiError        │    │ ApiResponse     │                     │
│  │ .badRequest()   │    │ .success()      │                     │
│  │ .notFound()     │    │ .created()      │                     │
│  │ .unauthorized() │    └─────────────────┘                     │
│  │ .forbidden()    │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ errorHandler    │                                            │
│  │ middleware      │                                            │
│  │                 │                                            │
│  │ - Log error     │                                            │
│  │ - Format resp   │                                            │
│  │ - Send JSON     │                                            │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation error, business logic error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Error | Server error (unexpected) |

---

## Security Measures

### Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Authentication                                               │
│     ├── JWT tokens (7-day expiry)                               │
│     ├── bcrypt password hashing (10 rounds)                     │
│     └── Token verification middleware                            │
│                                                                  │
│  2. Authorization                                                │
│     ├── Role-based access control (customer/admin)              │
│     └── Resource ownership verification                          │
│                                                                  │
│  3. Input Validation                                             │
│     ├── express-validator for all inputs                        │
│     ├── Mongoose schema validation                              │
│     └── Sanitization of user inputs                             │
│                                                                  │
│  4. CORS Configuration                                           │
│     ├── Whitelist allowed origins                               │
│     └── Credentials support                                      │
│                                                                  │
│  5. Data Protection                                              │
│     ├── Password never returned in responses                    │
│     ├── Sensitive data excluded from JWT                        │
│     └── Environment variables for secrets                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Database Indexes

```javascript
// User indexes
userSchema.index({ email: 1 });           // Unique, login lookup

// Product indexes
productSchema.index({ category: 1 });      // Menu filtering
productSchema.index({ isAvailable: 1 });   // Active products

// Order indexes
orderSchema.index({ orderNumber: 1 });     // Order tracking
orderSchema.index({ user: 1, createdAt: -1 }); // User orders
orderSchema.index({ status: 1 });          // Admin filtering
orderSchema.index({ createdAt: -1 });      // Recent orders

// Cart indexes
cartSchema.index({ user: 1 });             // User cart lookup
cartSchema.index({ sessionId: 1 });        // Guest cart lookup
```

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend Caching                                                │
│  ├── React Context for auth & cart state                        │
│  ├── Local storage for JWT token                                │
│  └── Session storage for guest cart ID                          │
│                                                                  │
│  Backend Considerations                                          │
│  ├── MongoDB connection pooling                                 │
│  ├── Lean queries for read-only operations                      │
│  └── Selective field population                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT OVERVIEW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                            │
│  │    GITHUB       │                                            │
│  │  Repository     │                                            │
│  └────────┬────────┘                                            │
│           │ Push                                                 │
│           ▼                                                      │
│  ┌─────────────────┐        ┌─────────────────┐                 │
│  │ GitHub Actions  │        │    Vercel       │                 │
│  │ (CI Pipeline)   │───────▶│  (Deployment)   │                 │
│  └─────────────────┘        └────────┬────────┘                 │
│                                      │                           │
│                                      ▼                           │
│           ┌──────────────────────────────────────────┐          │
│           │              VERCEL EDGE                  │          │
│           │  ┌─────────────────────────────────────┐ │          │
│           │  │          React Frontend              │ │          │
│           │  │         (Static Files)               │ │          │
│           │  └─────────────────────────────────────┘ │          │
│           │  ┌─────────────────────────────────────┐ │          │
│           │  │         Express Backend              │ │          │
│           │  │       (Serverless Functions)         │ │          │
│           │  └──────────────────┬──────────────────┘ │          │
│           └─────────────────────┼────────────────────┘          │
│                                 │                                │
│                                 ▼                                │
│           ┌─────────────────────────────────────────┐           │
│           │           MongoDB Atlas                  │           │
│           │          (Cloud Database)                │           │
│           └─────────────────────────────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Conclusion

This technical documentation provides a comprehensive overview of the CrewPlus Pizza Ordering Portal architecture, including:

- **System Architecture**: MERN stack with clear separation of concerns
- **Database Design**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with role-based access control
- **Order Management**: State machine for order processing
- **Cart System**: Guest and authenticated user support with merge capability
- **Coupon System**: Flexible discount engine
- **Customization**: Pizza customization with dynamic pricing
- **Email Notifications**: SMTP-based order updates
- **CI/CD**: GitHub Actions with Vercel deployment

For questions or contributions, please refer to the project repository.
