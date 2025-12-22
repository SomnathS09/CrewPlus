# Deployment Guide

This guide covers various deployment options for the CrewPlus Retail Ordering Portal.

## Table of Contents
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Cloud Deployment](#cloud-deployment)
  - [Vercel (Frontend)](#vercel-frontend)
  - [Render (Backend)](#render-backend)
  - [MongoDB Atlas](#mongodb-atlas)

---

## Docker Deployment

The easiest way to deploy the entire application.

### Prerequisites
- Docker
- Docker Compose

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/SomnathS09/CrewPlus.git
cd CrewPlus
```

2. **Create environment file**
```bash
# Create .env file in root directory
echo "API_KEY=your-production-api-key" > .env
```

3. **Start services**
```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend on port 3001
- Frontend on port 3000

4. **Seed the database**
```bash
docker-compose exec backend node seed.js
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/health

6. **View logs**
```bash
docker-compose logs -f
```

7. **Stop services**
```bash
docker-compose down
```

---

## Manual Deployment

### Backend Deployment

1. **Server Requirements**
- Node.js 18+
- MongoDB 6+
- PM2 (for process management)

2. **Setup**
```bash
# Install PM2 globally
npm install -g pm2

# Navigate to backend
cd backend

# Install dependencies
npm ci --only=production

# Create .env file
cat > .env << EOF
PORT=3001
MONGODB_URI=mongodb://localhost:27017/crewplus
API_KEY=your-production-api-key
NODE_ENV=production
EOF

# Seed database
node seed.js

# Start with PM2
pm2 start server.js --name crewplus-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

3. **Configure Nginx (optional)**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Frontend Deployment

1. **Build the application**
```bash
cd frontend

# Create production .env
cat > .env.production << EOF
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_API_KEY=your-production-api-key
EOF

# Build
npm run build
```

2. **Serve with Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Cloud Deployment

### MongoDB Atlas

1. **Create Account**
- Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
- Sign up for a free account

2. **Create Cluster**
- Choose the free tier (M0)
- Select a cloud provider and region
- Click "Create Cluster"

3. **Configure Access**
- Database Access: Create a database user with password
- Network Access: Add your IP address (or 0.0.0.0/0 for allow all)

4. **Get Connection String**
- Click "Connect"
- Choose "Connect your application"
- Copy the connection string
- Replace `<password>` with your database user password
- Use this in your backend .env file

### Render (Backend)

1. **Create Account**
- Sign up at [render.com](https://render.com)

2. **Create Web Service**
- Click "New +"
- Select "Web Service"
- Connect your GitHub repository
- Configure:
  - Name: crewplus-backend
  - Environment: Node
  - Build Command: `cd backend && npm install`
  - Start Command: `cd backend && node server.js`
  - Add environment variables:
    - `PORT`: 3001
    - `MONGODB_URI`: Your Atlas connection string
    - `API_KEY`: Your secret key
    - `NODE_ENV`: production

3. **Deploy**
- Click "Create Web Service"
- Wait for deployment to complete
- Note your service URL (e.g., https://crewplus-backend.onrender.com)

4. **Seed Database**
- Use Render shell or add a one-time job:
```bash
node seed.js
```

### Vercel (Frontend)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy from Command Line**
```bash
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts to configure
```

3. **Configure Environment Variables**
In Vercel dashboard:
- Go to your project settings
- Add environment variables:
  - `REACT_APP_API_URL`: Your Render backend URL + /api
  - `REACT_APP_API_KEY`: Your secret key

4. **Deploy to Production**
```bash
vercel --prod
```

Alternatively, connect GitHub repository to Vercel:
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Configure build settings:
  - Framework Preset: Create React App
  - Root Directory: frontend
  - Build Command: npm run build
  - Output Directory: build
- Add environment variables
- Deploy

---

## Post-Deployment Checklist

- [ ] Backend health check responds: `curl https://your-backend/health`
- [ ] Database is seeded with products
- [ ] Frontend can load the menu
- [ ] API key authentication works
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] SSL/TLS certificates are configured (for production)
- [ ] Error logging is set up
- [ ] Monitoring is configured
- [ ] Backup strategy is in place for database

---

## Monitoring and Maintenance

### Backend Monitoring with PM2
```bash
# View status
pm2 status

# View logs
pm2 logs crewplus-backend

# Restart
pm2 restart crewplus-backend

# Monitor
pm2 monit
```

### Database Backup (MongoDB)
```bash
# Backup
mongodump --uri="your-mongodb-uri" --out=/backup/path

# Restore
mongorestore --uri="your-mongodb-uri" /backup/path
```

### Updating the Application

**Backend:**
```bash
cd backend
git pull
npm ci --only=production
pm2 restart crewplus-backend
```

**Frontend:**
```bash
cd frontend
git pull
npm ci
npm run build
# Copy build files to web server
```

---

## Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify environment variables
- Check logs: `pm2 logs` or `docker-compose logs backend`

### Frontend can't connect to backend
- Verify CORS settings
- Check API_URL environment variable
- Verify API key matches on both sides

### Database connection issues
- Check MongoDB is running
- Verify connection string
- Check network/firewall settings
- For Atlas: verify IP whitelist

---

## Security Considerations

1. **Change default API key** - Never use default keys in production
2. **Use HTTPS** - Configure SSL certificates
3. **Restrict CORS** - Only allow your frontend domain
4. **Rate limiting** - Add rate limiting middleware
5. **Input validation** - Already implemented but verify
6. **Environment variables** - Never commit .env files
7. **MongoDB** - Use strong passwords and restrict network access
8. **Regular updates** - Keep dependencies updated

---

## Cost Estimation (Free Tier)

- MongoDB Atlas: Free (M0 tier - 512MB)
- Render: Free (750 hours/month)
- Vercel: Free (100GB bandwidth/month)

**Total:** $0/month for low traffic applications

For production with higher traffic, expect:
- MongoDB Atlas: $9-57/month
- Render: $7/month per service
- Vercel: Free to $20/month
