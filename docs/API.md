# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All API endpoints (except health check) require authentication via the `x-api-key` header.

**Header:**
```
x-api-key: your-secret-api-key-here
```

## Endpoints

---

### Health Check

**GET** `/health`

Check if the server is running.

**Authentication:** Not required

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-12-22T07:24:40.451Z"
}
```

---

### Menu Endpoints

#### Get Menu

**GET** `/api/menu`

Retrieve all products categorized by type.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "pizzas": [
      {
        "_id": "67879abc123def456",
        "name": "Margherita Pizza",
        "category": "Pizza",
        "price": 299,
        "inventory": 50,
        "imageUrl": "https://via.placeholder.com/150",
        "createdAt": "2025-12-22T07:00:00.000Z",
        "updatedAt": "2025-12-22T07:00:00.000Z"
      }
    ],
    "drinks": [...],
    "breads": [...]
  }
}
```

---

### Cart Endpoints

#### Add/Update Cart Item

**POST** `/api/cart`

Add a product to cart or update quantity if already exists.

**Authentication:** Required

**Request Body:**
```json
{
  "sessionId": "session-123",
  "productId": "67879abc123def456",
  "quantity": 2
}
```

**Validation:**
- `sessionId`: Required, string
- `productId`: Required, valid MongoDB ObjectId
- `quantity`: Required, integer >= 1

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "67879def456ghi789",
    "sessionId": "session-123",
    "items": [
      {
        "productId": {
          "_id": "67879abc123def456",
          "name": "Margherita Pizza",
          "price": 299,
          "inventory": 50
        },
        "quantity": 2,
        "_id": "67879xyz789abc012"
      }
    ],
    "createdAt": "2025-12-22T07:00:00.000Z",
    "updatedAt": "2025-12-22T07:10:00.000Z"
  }
}
```

**Error Responses:**
```json
// Product not found
{
  "success": false,
  "message": "Product not found"
}

// Validation error
{
  "success": false,
  "errors": [
    {
      "msg": "Quantity must be at least 1",
      "param": "quantity"
    }
  ]
}
```

#### Get Cart

**GET** `/api/cart/:sessionId`

Retrieve cart for a specific session.

**Authentication:** Required

**Parameters:**
- `sessionId` (path): Session identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "67879def456ghi789",
    "sessionId": "session-123",
    "items": [
      {
        "productId": {
          "_id": "67879abc123def456",
          "name": "Margherita Pizza",
          "price": 299,
          "inventory": 50
        },
        "quantity": 2
      }
    ],
    "createdAt": "2025-12-22T07:00:00.000Z",
    "updatedAt": "2025-12-22T07:10:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Cart not found"
}
```

---

### Order Endpoints

#### Place Order

**POST** `/api/orders`

Create a new order from cart items.

**Authentication:** Required

**Request Body:**
```json
{
  "sessionId": "session-123",
  "items": [
    {
      "productId": "67879abc123def456",
      "quantity": 2
    },
    {
      "productId": "67879abc123def457",
      "quantity": 1
    }
  ],
  "type": "delivery"
}
```

**Validation:**
- `sessionId`: Required, string
- `items`: Required, array with at least 1 item
- `type`: Required, must be "delivery" or "carryout"

**Process:**
1. Validates all products exist
2. Checks inventory availability
3. Deducts inventory atomically
4. Creates order record
5. Clears the cart
6. Returns order confirmation

**Response:**
```json
{
  "success": true,
  "data": {
    "orderNumber": "ORD-20251222-001",
    "total": 897,
    "status": "confirmed"
  }
}
```

**Error Responses:**
```json
// Insufficient inventory
{
  "success": false,
  "message": "Insufficient inventory for Margherita Pizza"
}

// Product not found
{
  "success": false,
  "message": "Product 67879abc123def456 not found"
}

// Validation error
{
  "success": false,
  "errors": [
    {
      "msg": "Type must be delivery or carryout",
      "param": "type"
    }
  ]
}
```

#### Get Orders

**GET** `/api/orders`

Retrieve orders filtered by session or user.

**Authentication:** Required

**Query Parameters:**
- `sessionId` (optional): Filter by session ID
- `userId` (optional): Filter by user ID (for authenticated users)

**Example:**
```
GET /api/orders?sessionId=session-123
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67879order123",
      "orderNumber": "ORD-20251222-001",
      "sessionId": "session-123",
      "userId": null,
      "items": [
        {
          "productId": "67879abc123def456",
          "name": "Margherita Pizza",
          "quantity": 2,
          "price": 299
        }
      ],
      "total": 598,
      "type": "delivery",
      "status": "confirmed",
      "createdAt": "2025-12-22T07:30:00.000Z",
      "updatedAt": "2025-12-22T07:30:00.000Z"
    }
  ]
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid API key)
- `404` - Not Found
- `500` - Internal Server Error

### Common Errors

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "API key is required"
}
```
or
```json
{
  "success": false,
  "message": "Invalid API key"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An error occurred"
}
```

In development mode, stack traces are included.

---

## Testing with cURL

### Get Menu
```bash
curl -X GET http://localhost:3001/api/menu \
  -H "x-api-key: your-secret-api-key-here"
```

### Add to Cart
```bash
curl -X POST http://localhost:3001/api/cart \
  -H "x-api-key: your-secret-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "productId": "PRODUCT_ID_HERE",
    "quantity": 2
  }'
```

### Place Order
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "x-api-key: your-secret-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "items": [
      {
        "productId": "PRODUCT_ID_HERE",
        "quantity": 2
      }
    ],
    "type": "delivery"
  }'
```

---

## Rate Limiting

Currently, no rate limiting is implemented. This should be added for production deployment.

## CORS

CORS is enabled for all origins in development. For production, configure specific origins in the backend server configuration.
