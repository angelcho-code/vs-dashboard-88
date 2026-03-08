import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { getSalesData } from './src/services/dataService.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sales-api',
      configureServer(server) {
        server.middlewares.use('/api/sales', async (req, res, next) => {
          try {
            const data = await getSalesData();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (error) {
            console.error("API error:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
          }
        });
      }
    }
  ],
})
