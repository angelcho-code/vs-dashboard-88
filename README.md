# VS-Dashboard 🚀

A clean, modern SaaS dashboard built with **React**, **Tailwind CSS**, and **Vite**.

## ✨ Features

- **KPI Cards**: Real-time calculation of metrics from CSV or Database.
- **AI Business strategist**: Insights powered by Google Gemini 3.1.
- **Easy Database Migration**: Connect to Supabase without touching any code!

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Installation
```bash
npm install
```

### 3. Development
```bash
npm run dev
```
The dashboard will be available at [http://localhost:5173](http://localhost:5173). By default, it reads data from `data/sales_data.csv`.

---

## 🗄️ Connecting Supabase (For Non-Coders)

The backend API is configured to read data from a local CSV by default, but is fully ready to connect to Supabase. Follow these simple steps:

1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project.
2. **Setup Table**: In the **SQL Editor** tab on the left, click "New Query" and run this snippet to create your table:
   ```sql
   CREATE TABLE sales_data (
     id bigint primary key generated always as identity,
     date date not null,
     product text not null,
     channel text not null,
     orders integer,
     revenue decimal,
     cost decimal,
     visitors integer,
     customers integer,
     created_at timestamptz default now()
   );
   ```
3. **Import Data**: In the **Table Editor** tab, select the `sales_data` table. Click "Insert" -> "Import CSV" and upload your `data/sales_data.csv` file.
4. **Get Credentials**: Go to **Project Settings** -> **API**. Copy your `Project URL` and `service_role` (or `anon`) key.
5. **Update Config**: Open your local `.env` file and update your credentials:
   ```env
   DATA_SOURCE=supabase
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
6. **Restart**: Stop your terminal (`Ctrl+C`) and run `npm run dev` again. Your dashboard is now live on Supabase!

---

## 📁 Project Structure
- `src/services/dataService.js`: The "brain" that chooses between CSV and Supabase.
- `vite.config.js`: The API that serves data to your frontend.
- `src/App.jsx`: The visual dashboard interface.
