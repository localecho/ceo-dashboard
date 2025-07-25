# 🚀 CEO Dashboard - GitHub Deployment Guide

## Quick GitHub Setup

### 1. Create GitHub Repository

```bash
# Using GitHub CLI (recommended)
gh repo create ceo-dashboard --public \
  --description "AI-Powered Executive Intelligence Platform with real-time analytics" \
  --add-readme

# Or manually at github.com/new
```

### 2. Push to GitHub

```bash
# Add remote (already configured)
git remote add origin https://github.com/localecho/ceo-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. GitHub Pages Deployment (Frontend)

1. Go to Settings → Pages in your GitHub repository
2. Source: Deploy from a branch
3. Branch: main
4. Folder: /mockups
5. Save

Your dashboard will be live at: `https://YOUR_USERNAME.github.io/ceo-dashboard/`

### 4. Backend Deployment Options

#### Option A: Heroku (Free Tier Available)
```bash
# Install Heroku CLI
# Create new app
heroku create your-ceo-dashboard

# Add PostgreSQL and Redis
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# Deploy
git push heroku main
```

#### Option B: Railway (Modern Alternative)
1. Visit [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add PostgreSQL and Redis services
4. Deploy automatically on push

#### Option C: Render (Free Tier)
1. Visit [render.com](https://render.com)
2. Create Web Service from GitHub repo
3. Add PostgreSQL and Redis
4. Auto-deploy on push

### 5. Environment Variables

For any deployment platform, set these variables:

```env
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_NAME=ceo_dashboard
DB_USER=your-db-user
DB_PASSWORD=your-db-password
REDIS_HOST=your-redis-host
REDIS_PORT=6379
JWT_SECRET=generate-a-secure-secret
FRONTEND_URL=https://your-username.github.io/ceo-dashboard
```

### 6. Update Frontend API URLs

In your dashboard HTML files, update the API URL:

```javascript
// Change from:
const API_URL = 'http://localhost:3001';

// To:
const API_URL = 'https://your-backend-url.herokuapp.com';
```

### 7. Enable CORS

Update `backend/src/app.js` to allow your GitHub Pages URL:

```javascript
app.use(cors({
  origin: ['https://your-username.github.io', 'http://localhost:8000'],
  credentials: true
}));
```

## 🎉 Launch Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled for frontend
- [ ] Backend deployed (Heroku/Railway/Render)
- [ ] Environment variables configured
- [ ] API URLs updated in frontend
- [ ] CORS configured
- [ ] Test all dashboards
- [ ] Share your live URL!

## 📧 Need Help?

- Create an issue in your GitHub repository
- Check the [documentation](ARCHITECTURE.md)
- Review the [contributing guide](CONTRIBUTING.md)

---

**Congratulations!** Your AI-powered CEO Dashboard is now live! 🚀

Don't forget to:
- ⭐ Star the repository
- 📢 Share with the community
- 🐛 Report any issues
- 🤝 Contribute improvements