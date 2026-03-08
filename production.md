# Production Deployment Guide (Vercel)

This document provides a clear step-by-step guide for deploying your VS-Dashboard to a live environment.

## 1. Prepare your GitHub Repository
Ensure all changes are committed and pushed:
```bash
git add .
git commit -m "Migrate to Next.js for production deployment"
git push origin main
```

## 2. Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New"** -> **"Project"**.
3. Import your `vs-dashboard-88` repository.
4. In the **Environment Variables** section, add the following:
   - `DATA_SOURCE`: `supabase`
   - `NEXT_PUBLIC_GEMINI_API_KEY`: (Your Google AI Key)
   - `VITE_SUPABASE_URL`: (Your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
5. Click **"Deploy"**.

## 3. Post-Deployment Verification
Once the deployment is finished:
1. Open the provided `.vercel.app` URL.
2. Check that the "Supabase Engine: active" status appears.
3. Verify that the "Performance Growth" chart renders correctly.
4. Run an AI Insight generation to confirm the Gemini API is connected.

## 4. Maintenance
- **Data Updates**: Any changes you make in the Supabase Table Editor will reflect on your live URL instantly after a page refresh.
- **Auto-Sync**: Every push to the `main` branch on GitHub will automatically trigger a new deployment on Vercel.
