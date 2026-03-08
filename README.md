# VS-Dashboard 🚀 (Next.js Edition)

A professional-grade SaaS dashboard built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **Supabase**.

## ✨ Features

- **Next.js App Router**: Optimized for performance and Vercel deployment.
- **KPI Analytics**: Dynamic calculation of Revenue, Orders, and Profit.
- **Growth Visualization**: Premium "Step" style charts with Recharts.
- **AI Strategic IQ**: Business insights powered by Google Gemini (Flash 3.1).
- **Hybrid Data Layer**: Switch between local CSV and Supabase via environment variables.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Configuration
Create a `.env` file locally:
```env
DATA_SOURCE=csv # or 'supabase'
NEXT_PUBLIC_GEMINI_API_KEY=your_key
VITE_SUPABASE_URL=your_url # Internal compat
VITE_SUPABASE_ANON_KEY=your_key # Internal compat
```

### 3. Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🌍 Vercel Deployment

This project is optimized for Vercel. 

1. Push your code to GitHub.
2. Link the repository in [Vercel](https://vercel.com).
3. Add the environment variables from your `.env` to the Vercel Dashboard.
4. Deploy!

For a detailed production guide, see [production.md](./production.md).
