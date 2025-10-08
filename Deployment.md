# 🚀 FoodBridge AI - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Environment Variables](#environment-variables)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Backend Deployment (Railway)](#backend-deployment-railway)
6. [AI Service Deployment (Railway)](#ai-service-deployment-railway)
7. [Testing Deployment](#testing-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account (for deployment)
- ✅ Vercel account (free tier)
- ✅ Railway account (free tier with $5 credit)
- ✅ MongoDB Atlas account (free M0 cluster)
- ✅ All API keys (Hugging Face, MapBox, OpenWeather, Cloudinary)

---

## MongoDB Atlas Setup

### 1. Create Free Cluster

1. Go to https://cloud.mongodb.com
2. Sign up or log in
3. Click **Build a Database**
4. Select **M0 Free** tier
5. Choose a cloud provider (AWS recommended)
6. Select region closest to your users
7. Name your cluster: `foodbridge-cluster`
8. Click **Create**

### 2. Create Database User

1. In **Security** → **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `foodbridge-admin`
5. Generate secure password (save it!)
6. Set role: **Atlas Admin**
7. Click **Add User**

### 3. Whitelist IP Addresses

1. In **Security** → **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Add comment: "FoodBridge App Access"
5. Click **Confirm**

### 4. Get Connection String

1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Select **Node.js** driver
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with `foodbridge`

```
mongodb+srv://foodbridge-admin:<password>@foodbridge-cluster.xxxxx.mongodb.net/foodbridge?retryWrites=true&w=majority
```

---

## Environment Variables

### Frontend (Client)

Create `client/.env.production`:

```env
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
VITE_SOCKET_URL=https://your-backend-url.railway.app
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1...your_mapbox_token
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### Backend (Server)

Environment variables for Railway:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://foodbridge-admin:password@cluster.mongodb.net/foodbridge

JWT_SECRET=your_super_long_random_secret_key_minimum_32_characters
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

HUGGING_FACE_API_KEY=hf_your_token
OPENWEATHER_API_KEY=your_openweather_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token

AI_SERVICE_URL=https://your-ai-service-url.railway.app
CLIENT_URL=https://your-app.vercel.app
```

### AI Service (Python)

Environment variables for Railway:

```env
FLASK_ENV=production
PORT=5001

HUGGING_FACE_API_KEY=hf_your_token
HF_MODEL_ENDPOINT=https://api-inference.huggingface.co/models

OPENWEATHER_API_KEY=your_openweather_key
MONGODB_URI=mongodb+srv://foodbridge-admin:password@cluster.mongodb.net/foodbridge
```

---

## Frontend Deployment (Vercel)

### Option 1: Deploy via Vercel Dashboard

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Select `client` as root directory
6. Framework Preset: **Vite**
7. Build Command: `pnpm build`
8. Output Directory: `dist`
9. Add environment variables (from above)
10. Click **Deploy**

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client folder
cd client

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts to configure
```

### Configure Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable from `client/.env.production`
4. Redeploy if needed

---

## Backend Deployment (Railway)

### 1. Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. You get $5 free credit monthly

### 2. Deploy Backend

#### Option A: Deploy from GitHub

1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your `food-bridge-AI` repository
4. Railway will auto-detect Node.js
5. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `pnpm install`
   - **Start Command**: `pnpm start`
   
#### Option B: Deploy via CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Navigate to server folder
cd server

# Initialize
railway init

# Add variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your_mongodb_uri
# ... add all other variables

# Deploy
railway up
```

### 3. Configure Environment Variables

1. In Railway Dashboard, select your project
2. Go to **Variables** tab
3. Click **New Variable**
4. Add all variables from backend env list above
5. Click **Deploy** to restart with new variables

### 4. Get Your Backend URL

1. Go to **Settings** tab
2. Under **Domains**, click **Generate Domain**
3. Copy the URL (e.g., `foodbridge-backend.railway.app`)
4. Use this URL in your frontend `VITE_API_BASE_URL`

---

## AI Service Deployment (Railway)

### 1. Create New Service

1. In Railway Dashboard, same project
2. Click **New** → **Empty Service**
3. Name it `ai-service`

### 2. Configure Python Service

1. Select the service
2. Go to **Settings**
3. Set **Root Directory**: `ai-service`
4. Set **Start Command**: `python app.py`

### 3. Add Environment Variables

Add all AI service variables from above

### 4. Deploy

```bash
# From root directory
cd ai-service

# Deploy to Railway
railway up
```

### 5. Get AI Service URL

1. Generate domain in Railway
2. Copy URL
3. Update `AI_SERVICE_URL` in backend environment variables

---

## Testing Deployment

### 1. Test Backend Health

```bash
curl https://your-backend-url.railway.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "FoodBridge AI Server is running!",
  "timestamp": "2025-01-15T..."
}
```

### 2. Test AI Service Health

```bash
curl https://your-ai-service-url.railway.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "FoodBridge AI Service is running!",
  "timestamp": "2025-01-15T..."
}
```

### 3. Test Frontend

1. Visit your Vercel URL
2. Try to register/login
3. Check browser console for errors
4. Verify API calls are working

### 4. Test Full Flow

1. **Register** as a business user
2. **Post** a food item
3. **View** AI predictions
4. Check if data is saved in MongoDB
5. Test recipient flows

---

## Custom Domain (Optional)

### Add Custom Domain to Vercel

1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `foodbridge.app`)
3. Follow DNS configuration instructions
4. Update CORS settings in backend

### Add Custom Domain to Railway

1. In Railway → **Settings** → **Domains**
2. Click **Custom Domain**
3. Add your domain
4. Configure DNS records
5. SSL certificates are auto-generated

---

## Troubleshooting

### MongoDB Connection Issues

**Problem**: Can't connect to MongoDB

**Solutions**:
- Verify IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure password doesn't contain special characters (URL encode if needed)
- Verify network access in MongoDB Atlas

### CORS Errors

**Problem**: Frontend can't connect to backend

**Solutions**:
- Add frontend URL to `CLIENT_URL` in backend
- Update CORS configuration in `app.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

### AI Service Not Responding

**Problem**: AI predictions fail

**Solutions**:
- Check AI service logs in Railway
- Verify Python dependencies installed
- Check Hugging Face API key is valid
- Ensure AI_SERVICE_URL is correct in backend

### Build Failures

**Problem**: Deployment fails during build

**Solutions**:
- Check build logs for specific errors
- Verify all dependencies in `package.json`
- Ensure Node.js version compatibility
- Check for TypeScript errors

### Environment Variables Not Working

**Problem**: App runs but features don't work

**Solutions**:
- Redeploy after adding new variables
- Check variable names match exactly
- No quotes around values in Railway
- Restart all services after changes

---

## Performance Optimization

### 1. Enable Compression

Already included in `app.js`:
```javascript
app.use(compression());
```

### 2. Database Indexes

Ensure indexes are created:
```javascript
// In connectDB function
mongoose.connection.db.collection('users').createIndex({ "profile.location": "2dsphere" });
mongoose.connection.db.collection('fooditems').createIndex({ "location": "2dsphere" });
```

### 3. Caching

Consider adding Redis for caching (Railway has Redis service)

### 4. CDN for Images

Cloudinary provides CDN automatically

---

## Monitoring & Logs

### Railway Logs

```bash
# View logs
railway logs

# Follow logs in real-time
railway logs --follow
```

### Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments**
4. Click on deployment → **View Build Logs**

### MongoDB Monitoring

1. In MongoDB Atlas → **Metrics**
2. Monitor connections, operations, disk usage

---

## Cost Estimates

### Free Tier Limits

- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Railway**: $5 credit/month (~500 hours)
- **MongoDB Atlas**: 512MB storage, shared cluster
- **Cloudinary**: 25 credits/month, 25GB storage
- **Hugging Face**: Free tier with rate limits

### Estimated Monthly Costs (after free tier)

- Small-scale (< 1000 users): **$0-10/month**
- Medium-scale (1000-10000 users): **$20-50/month**
- Large-scale (10000+ users): **$100+/month**

---

## Security Checklist

- ✅ Use environment variables for secrets
- ✅ Enable HTTPS (automatic on Vercel/Railway)
- ✅ Set secure JWT secret (32+ characters)
- ✅ Whitelist specific IPs for MongoDB (or use 0.0.0.0/0)
- ✅ Enable rate limiting for API endpoints
- ✅ Validate all user inputs
- ✅ Use helmet.js for security headers (already included)
- ✅ Keep dependencies updated

---

## Backup Strategy

### Database Backups

1. In MongoDB Atlas → **Backup**
2. Enable **Cloud Backups** (free on M2+)
3. Or manually export data:

```bash
mongodump --uri="mongodb+srv://..." --out=./backup
```

### Code Backups

- Use Git for version control
- Push to GitHub regularly
- Tag releases: `git tag v1.0.0`

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 1 second
- Database connections maxing out
- Railway memory usage > 80%
- Error rates increasing

### How to Scale

1. **Database**: Upgrade MongoDB Atlas tier
2. **Backend**: Use Railway autoscaling or move to AWS
3. **Frontend**: Vercel scales automatically
4. **AI Service**: Use queue system for heavy processing

---

## Post-Deployment

### 1. Update README

Add deployment URLs:
```markdown
## Live Demo

- **App**: https://foodbridge.vercel.app
- **API**: https://foodbridge-backend.railway.app
- **Status**: https://status.foodbridge.app
```

### 2. Test with Real Users

- Create test accounts for each user type
- Share with beta testers
- Monitor error logs
- Gather feedback

### 3. Submit to Hackathon

Include in submission:
- Live demo URL
- GitHub repository link
- Demo video
- Documentation
- Impact metrics
