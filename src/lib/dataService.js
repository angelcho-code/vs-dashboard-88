import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const dataSource = process.env.DATA_SOURCE || 'csv';

const useSupabase = dataSource === 'supabase' && supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url';

let supabase = null;
if (useSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const getSalesData = async () => {
  if (useSupabase) {
    try {
      const { data, error } = await supabase
        .from('sales_data')
        .select('*')
        .order('date', { ascending: false });
      
      if (!error) return data;
      console.warn("Supabase fetch error, falling back to CSV:", error.message);
    } catch (e) {
      console.warn("Supabase connection failed, falling back to CSV");
    }
  }

  // Fallback to CSV
  return new Promise((resolve, reject) => {
    const filePath = path.resolve(process.cwd(), 'data', 'sales_data.csv');
    if (!fs.existsSync(filePath)) {
      return reject(new Error('Sales data CSV not found'));
    }

    const csvText = fs.readFileSync(filePath, 'utf8');
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    });
  });
};
