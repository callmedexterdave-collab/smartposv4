# Deploy to Netlify - Quick Guide

## Method 1: Drag & Drop (Easiest)

1. Go to https://app.netlify.com and sign up (free)

2. After signing up, click "Add new site" → "Deploy manually"

3. Open File Explorer and navigate to:
   ```
   C:\Users\LENOVO\Downloads\smarpos - backup-v2\BudgetManager\dist\public
   ```

4. Drag and drop the entire `public` folder into Netlify

5. Your app will be live in seconds! 🎉

6. Copy the URL (e.g., `https://your-app-name.netlify.app`)

## Method 2: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy from the public folder
cd dist/public
netlify deploy

# For production deploy
netlify deploy --prod
```

## Method 3: GitHub Integration (Automatic)

1. Push your code to GitHub
2. Connect GitHub repo to Netlify
3. Netlify auto-deploys on every push

## After Deployment

✅ Share the URL with other devices  
✅ Install as PWA (Add to Home Screen)  
✅ Works offline after first load  
✅ Router sharing enabled

**Your app URL: https://[your-app-name].netlify.app**

