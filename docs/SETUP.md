# Quick Start Guide

## Prerequisites Installation

### 1. Install Node.js
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Recommended version: 18.x or higher
- Verify installation: `node --version` and `npm --version`

### 2. Install MongoDB

#### Option A: Local Installation
**Windows:**
- Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### Option B: Use MongoDB Atlas (Cloud)
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Whitelist your IP address
5. Use the connection string in your `.env` file

## Project Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/SomnathS09/CrewPlus.git
cd CrewPlus
```

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your settings
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/crewplus
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crewplus

# Seed the database
node seed.js

# Start the backend server
npm start
```

The backend should now be running on `http://localhost:3001`

### Step 3: Frontend Setup
Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file
# Make sure REACT_APP_API_KEY matches the API_KEY in backend/.env

# Start the frontend
npm start
```

The frontend should now be running on `http://localhost:3000`

## Testing the Application

### 1. Manual Testing via Browser
1. Open `http://localhost:3000` in your browser
2. You should see the menu with pizzas, drinks, and breads
3. Add items to cart
4. Click the cart button in the header
5. Select delivery or carryout
6. Place order
7. Verify order confirmation appears

### 2. API Testing via Postman
1. Import the Postman collection from `docs/postman-collection.json`
2. Update the `apiKey` variable with your actual API key
3. Test each endpoint:
   - Health Check
   - Get Menu
   - Add to Cart
   - Get Cart
   - Place Order
   - Get Orders

### 3. Running Automated Tests
```bash
cd backend
npm test
```

## Common Issues and Solutions

### MongoDB Connection Issues
**Error:** "MongoNetworkError: connect ECONNREFUSED"
- **Solution:** Make sure MongoDB is running
  - Local: `sudo systemctl status mongodb` or check Services on Windows
  - Atlas: Check if your IP is whitelisted

### API Key Issues
**Error:** 401 Unauthorized
- **Solution:** Ensure the API keys match in both backend and frontend `.env` files

### Port Already in Use
**Error:** "Port 3001 is already in use"
- **Solution:** 
  - Kill the process using that port
  - Or change the PORT in backend/.env

### CORS Errors
**Error:** "CORS policy blocked"
- **Solution:** The backend already has CORS enabled, but if you change ports, update accordingly

### npm Install Failures
**Error:** Various npm errors
- **Solution:**
  - Clear npm cache: `npm cache clean --force`
  - Delete node_modules and package-lock.json
  - Run `npm install` again

## Verifying the Installation

After setup, verify that:
1. ✅ Backend is running on port 3001
2. ✅ Frontend is running on port 3000
3. ✅ Health check endpoint works: `http://localhost:3001/health`
4. ✅ Menu loads in the browser
5. ✅ You can add items to cart
6. ✅ You can place an order

## Next Steps

- Customize the product data in `backend/seed.js`
- Add your own styling to the frontend
- Explore the API using Postman
- Review the code structure and understand the flow
- Try implementing the stretch goals (user auth, email notifications)

## Support

For issues or questions:
- Check the main README.md
- Review the SRS document in `docs/srs.md`
- Check the code comments in the source files
