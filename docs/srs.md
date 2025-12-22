# **Design Document: Retail Ordering Portal for Pizza, Cold Drinks & Breads**

---

## **1. Document Overview**

This document outlines the technical design of a Retail Ordering Portal. The application enables customers to browse a menu of pizzas, cold drinks, and breads, manage a shopping cart, and place carryout or delivery orders. The system includes inventory management, secure RESTful APIs, user authentication (optional for stretch goals), order history, and email confirmation capabilities.

This design covers architecture, components, data model, APIs, security, deployment, and testing aligned with the MVP scope and stretch goals defined in the project brief.

---

## **2. Business & Functional Context**

### **Business Goal**
- Launch a lightweight, scalable retail ordering portal enabling:
  - Menu browsing
  - Cart management
  - Order placement (delivery/carryout)
  - Real-time inventory updates
  - Secure API access

### **Core Functional Features (MVP)**
- Menu API: List products with inventory
- Cart API: Add/update items, compute totals
- Order API: Place order, deduct inventory
- Secure REST endpoints (`x-api-key` based)
- Email confirmation (stretch)
- Authenticated order history (stretch)

### **User Roles**
- **Guest User**: Browse menu, add to cart, place order (no history)
- **Authenticated User** *(stretch)*: View past orders, receive email confirmation

---

## **3. High-Level Architecture**

![](/docs/Assets/high_level_overview.jpeg)

---

## **4. Component Architecture**

![](/docs/Assets/high_level_diagram.jpeg)

### **Frontend Components**
- `MenuPage`: Fetch & display categorized products
- `ProductCard`: Show name, price, inventory, “Add to Cart” button
- `CartPage`: List cart items, subtotal, place order button
- `OrderConfirmation`: Show success + order ID
- *(Stretch)* `OrderHistory`: Authenticated route showing past orders

### **Backend Services**
- **Menu Service**: `GET /api/menu` → list all items by category
- **Cart Service**: 
  - `POST /api/cart` → create/update cart (session or user-based)
  - `GET /api/cart/:id` → retrieve cart
- **Order Service**:
  - `POST /api/orders` → place order, validate inventory, decrement stock
  - *(Stretch)* `GET /api/orders` → list user orders
- **Auth & Security Middleware**: Validate `x-api-key`
- **Email Service** *(stretch)*: Send order confirmation via SMTP

### **Shared Utilities**
- Logger
- Error handler middleware
- API key validator

![](/docs/Assets/flow_diagram.jpeg)

---

## **5. Technology Stack**

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| **Frontend**   | React.js                          |
| **Styling**    | CSS                               |
| **Backend**    | Node.js + Express.js              |
| **Database**   | MongoDB                           |
| **API**        | RESTful (JSON)                    |
| **Security**   | `x-api-key` header validation     |
| **Email**      | SMTP *(stretch)*                  |
| **CI/CD**      | GitHub Actions                    |
| **Hosting**    | (TODO: TBD) Frontend: Vercel; Backend: Render |
| **Testing**    | API test, Functional test         |
| **Monitoring** | Console logging                   |


---

## **6. Data Architecture**

### **Database: MongoDB Collections**

#### **1. `products`**
```json
{
  "_id": ObjectId,
  "name": "Singh Pizza",
  "category": "Pizza",
  "price": 399,
  "inventory": 50,
  "imageUrl": "..."
}
```

#### **2. `carts`**
```json
{
  "_id": ObjectId,
  "sessionId": "abc123", // or userId if auth
  "items": [
    { "productId": ObjectId, "quantity": 2 }
  ],
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

#### **3. `orders`**
```json
{
  "_id": ObjectId,
  "orderNumber": "ORD-20251222-001",
  "sessionId": "abc123",
  "userId": null, // populated if auth *(stretch)*
  "items": [
    { "productId": ObjectId, "name": "...", "quantity": 2, "price": 399 }
  ],
  "total": 799,
  "type": "delivery" | "carryout",
  "status": "confirmed",
  "createdAt": ISODate
}
```

---

## **7. API & Integration Design**

All endpoints require header: `x-api-key: <valid_key>`

### **Menu API**
- `GET /api/menu`  
  → Response: `{ pizzas: [...], drinks: [...], breads: [...] }`

### **Cart API**
- `POST /api/cart`  
  Request: `{ sessionId, productId, quantity }`  
  Response: updated cart object
- `GET /api/cart/:sessionId`

### **Order API**
- `POST /api/orders`  
  Request: `{ sessionId, items, type (delivery/carryout) }`  
  Response: `{ success: true, orderNumber: "ORD-..." }`

### **Order History (Stretch)**
- `GET /api/orders?userId=...` → requires auth logic

### **Postman Integration**
- Collection includes all core endpoints with `x-api-key` pre-filled
- Environment variables for base URL and API key

---

## **8. Security Architecture**

- **API Authentication**: All endpoints secured via custom header `x-api-key`
  - Backend validates against a stored key (from env variable)
  - Invalid key → `401 Unauthorized`
- **No sensitive user data in MVP**
- **CORS**: Restricted to frontend origin
- **Input Validation**: Express Validator or Zod
- **Error Handling**: Generic messages (no stack traces in prod)
- **Stretch**: JWT-based auth for order history (if implemented)

---

## **9. Non-Functional Requirements (NFRs)**

| NFR | Requirement |
|-----|------------|
| **Availability** | 99% uptime during demo |
| **Performance** | API response < 1s for 95% of requests |
| **Scalability** | Stateless backend; DB can scale via Atlas |
| **Reliability** | Idempotent order placement; inventory checks atomic |
| **Maintainability** | Modular code, clear README, logging |
| **Deployability** | Fully automated via GitHub Actions |
| **Security** | API key enforced; no PII stored in MVP |

---

## **10. Deployment Architecture**

![](/docs/Assets/deployment.jpeg)

- **Frontend**: Vercel (auto-deploys from `main` branch)
- **Backend**: Render (Node.js service, env vars for DB + API key)
- **Database**: MongoDB Atlas (free tier, whitelisted IPs)
- **CI/CD Pipeline**:
  - On push to `main`:
    - Install deps
    - Run lint + unit + API tests
    - Deploy if all pass

---

## **11. Testing Strategy**

| Test Type | Tool | Scope |
|--------|------|------|
| **Unit Testing** | Jest | Service logic, utils |
| **API Testing** | Supertest | Menu, Cart, Order endpoints |
| **Frontend Testing** | React Testing Library | Cart UI, product listing |
| **E2E (Manual)** | Browser + Postman | Full user flow: browse → cart → order |
| **Security Test** | Postman | Missing/wrong `x-api-key` → 401 |
| **CI/CD** | GitHub Actions | Block deploy if any test fails |


---

**Prepared by**: Crew+
**Date**: December 22, 2025  
**Version**: 1.0 (MVP Scope)  
**Repository**: [Github.com](https://github.com/SomnathS09/hcl-rag)
