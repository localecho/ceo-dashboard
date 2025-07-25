# Vercel Deployment Guide

## 🚀 Quick Deploy

Your CEO Dashboard demo is now ready to deploy to Vercel!

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy: Y
# - Which scope: (select your account)
# - Link to existing project: N
# - Project name: ceo-dashboard-demo
# - In which directory: ./
# - Want to override settings: N
```

### Option 2: Deploy via Vercel Dashboard

1. Visit [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Import Git Repository
4. Enter the GitHub URL: `https://github.com/localecho/ceo-dashboard-demo`
5. Click "Import"
6. Configure:
   - Project Name: `ceo-dashboard-demo`
   - Framework Preset: Other
   - Root Directory: ./
7. Click "Deploy"

### Option 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/localecho/ceo-dashboard-demo)

## 🔗 After Deployment

Once deployed, you'll get a URL like:
- `https://ceo-dashboard-demo.vercel.app`
- `https://ceo-dashboard-demo-yourusername.vercel.app`

### Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## 📱 Test Your Deployment

After deployment, test all three mockups:
1. Main navigation page: `/`
2. Executive Cockpit: `/mockups/executive_cockpit.html`
3. Revenue Engine: `/mockups/revenue_engine.html`
4. Operations Center: `/mockups/operations_center.html`

## 🔄 Updates

To update your deployment after making changes:

```bash
# Make your changes
git add .
git commit -m "Update description"
git push

# Vercel will automatically redeploy
```

## 🎉 Success!

Your CEO Dashboard demo showcase is now live and ready to share with potential customers!