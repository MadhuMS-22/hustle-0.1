# 🚀 Deployment Guide: Frontend (Vercel) + Backend (Render)

## 📋 Prerequisites
- GitHub repository with your code
- Vercel account
- Render account
- MongoDB Atlas database (already set up)

## 🔧 Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your repository

### 1.2 Deploy Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure settings:
   - **Name**: `hustle-backend`
   - **Root Directory**: `ak-hustle/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: `18.x`

### 1.3 Set Environment Variables in Render
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://hustle:hustle2025@hustle.rvzvjyg.mongodb.net/Hustle?retryWrites=true&w=majority
JWT_SECRET=6bc9576301ada3899a3de18914aeff5ee7c28ea66799d96c9ec51e68d8e929b97315a93df0618d01f99cf28f22d1c5890f74af88eceb4a074851178fe5a81daa
JWT_EXPIRE=7d
FRONTEND_URL=https://your-app.vercel.app
```

### 1.4 Test Backend
- Wait for deployment to complete
- Test: `https://your-backend-name.onrender.com/api/health`
- Note down your backend URL

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### 2.2 Configure Frontend Project
1. Select your repository
2. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `ak-hustle/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3 Set Environment Variables in Vercel
```
VITE_API_URL=https://your-backend-name.onrender.com/api
```

### 2.4 Deploy
- Click "Deploy"
- Wait for deployment to complete
- Note down your frontend URL

## 🔄 Step 3: Update CORS Settings

### 3.1 Update Backend CORS
After getting your Vercel URL, update the CORS settings in your backend:

1. Go to Render dashboard
2. Navigate to your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` with your actual Vercel URL
5. Redeploy the service

### 3.2 Update CORS in Code (Optional)
Update `ak-hustle/backend/server.js` CORS configuration with your actual Vercel URL.

## ✅ Step 4: Final Testing

### 4.1 Test Frontend
- Visit your Vercel URL
- Test registration/login
- Test competition rounds
- Check browser console for errors

### 4.2 Test Backend
- Test API endpoints directly
- Check Render logs for errors
- Verify database connections

## 🔧 Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://hustle:hustle2025@hustle.rvzvjyg.mongodb.net/Hustle?retryWrites=true&w=majority
JWT_SECRET=6bc9576301ada3899a3de18914aeff5ee7c28ea66799d96c9ec51e68d8e929b97315a93df0618d01f99cf28f22d1c5890f74af88eceb4a074851178fe5a81daa
JWT_EXPIRE=7d
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend-name.onrender.com/api
```

## 🚨 Important Notes

1. **CORS**: Make sure your backend CORS includes your Vercel URL
2. **Environment Variables**: Never commit sensitive data to Git
3. **Database**: Your MongoDB Atlas is already production-ready
4. **HTTPS**: Both platforms provide SSL certificates automatically
5. **Monitoring**: Check logs regularly for errors

## 🔍 Troubleshooting

### Common Issues:
1. **CORS Errors**: Update FRONTEND_URL in Render
2. **API Not Found**: Check VITE_API_URL in Vercel
3. **Database Connection**: Verify MONGODB_URI in Render
4. **Build Failures**: Check Node version compatibility

### Debug Steps:
1. Check browser console for frontend errors
2. Check Render logs for backend errors
3. Test API endpoints directly
4. Verify environment variables are set correctly
