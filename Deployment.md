# 🚀 FoodBridge AI - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Environment Variables](#environment-variables)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Backend Deployment (Render)](#backend-deployment-render)
6. [AI Service Deployment (Render)](#ai-service-deployment-render)
7. [Testing Deployment](#testing-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account
- ✅ Vercel account (for frontend)
- ✅ Render account (for backend & AI service)
- ✅ MongoDB Atlas account (free M0 cluster)
- ✅ All API keys (Hugging Face, MapBox, OpenWeather, Cloudinary)

---

## MongoDB Atlas Setup

### 1. Create Free Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign up or log in
3. Click **Build a Database**
4. Select **M0 Free** tier
5. Choose a cloud provider (AWS recommended)
6. Select region closest to your users
7. Name your cluster: `foodbridge-cluster`
8. Click **Create**

### 2. Create Database User
1. In **Security → Database Access**, click **Add New Database User**
2. Choose **Password** authentication
3. Username: `foodbridge-admin`
4. Generate a secure password (save it!)
5. Set role: **Atlas Admin**
6. Click **Add User**

### 3. Whitelist IP Addresses
1. In **Security → Network Access**, click **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0)
3. Add comment: "FoodBridge App Access"
4. Click **Confirm**

### 4. Get Connection String
1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Select **Node.js** driver
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with `foodbridge`

```

mongodb+srv://foodbridge-admin:<password>@foodbridge-cluster.xxxxx.mongodb.net/foodbridge?retryWrites=true&w=majority

````

---

## Environment Variables

### Frontend (Client)

Create `client/.env.production`:

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1...your_mapbox_token
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
````

### Backend (Server)

Environment variables for Render:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://foodbridge-admin:<password>@foodbridge-cluster.xxxxx.mongodb.net/foodbridge

JWT_SECRET=your_super_long_random_secret_key_minimum_32_characters
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

HUGGING_FACE_API_KEY=hf_your_token
OPENWEATHER_API_KEY=your_openweather_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token

AI_SERVICE_URL=https://your-ai-service-url.onrender.com
CLIENT_URL=https://your-frontend-url.vercel.app
```

### AI Service (Python)

Environment variables for Render:

```env
FLASK_ENV=production
PORT=5001

HUGGING_FACE_API_KEY=hf_your_token
HF_MODEL_ENDPOINT=https://api-inference.huggingface.co/models

OPENWEATHER_API_KEY=your_openweather_key
MONGODB_URI=mongodb+srv://foodbridge-admin:<password>@foodbridge-cluster.xxxxx.mongodb.net/foodbridge
```

---

## Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com) → Sign in with GitHub
2. Click **Add New → Project** → Import your GitHub repo
3. Set **Root Directory**: `client`
4. Framework Preset: **Vite**
5. Build Command: `pnpm build`
6. Output Directory: `dist`
7. Add all frontend environment variables
8. Click **Deploy**

---

## Backend Deployment (Render)

1. Go to [Render](https://render.com) → Create Account or Sign in
2. Click **New → Web Service**
3. Connect GitHub repo
4. Root Directory: `server`
5. Environment: **Node**
6. Build Command: `pnpm install && pnpm build`
7. Start Command: `pnpm start`
8. Add all environment variables
9. Click **Create Web Service**
10. Copy the backend URL and use in `VITE_API_BASE_URL`

---

## AI Service Deployment (Render)

1. In Render, click **New → Web Service**
2. Connect GitHub repo → Root Directory: `ai-service`
3. Environment: **Python**
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `pnpm run ai:dev` (or `py -m app.py` if you configure properly)
6. Add all AI service environment variables
7. Click **Create Web Service**
8. Copy AI service URL → update `AI_SERVICE_URL` in backend env

---

## Testing Deployment

### Backend Health

```bash
curl https://your-backend-url.onrender.com/api/health
```

### AI Service Health

```bash
curl https://your-ai-service-url.onrender.com/api/health
```

### Frontend Test

1. Visit Vercel URL
2. Register/login
3. Check API calls work and console for errors

### Full Flow

* Register as a business user
* Post a food item
* View AI predictions
* Verify MongoDB data storage

---

## Troubleshooting

* **MongoDB Connection Issues**

  * Check whitelist, connection string, password encoding

* **CORS Errors**

  * Add frontend URL to backend CORS `origin` array

* **AI Service Not Responding**

  * Verify Python dependencies
  * Check Hugging Face API key
  * Ensure AI_SERVICE_URL matches deployed URL

* **Build Failures**

  * Check logs for dependency or Node version issues
  * Ensure `pnpm install` ran successfully

---

## Post-Deployment

* Update README with live URLs:

```markdown
## Live Demo
- **App**: https://your-frontend-url.vercel.app
- **API**: https://your-backend-url.onrender.com
```

* Test all flows with real users
* Monitor logs in Render and Vercel
