// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Lee las variables con el prefijo VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación temprana
if (!supabaseUrl || !supabaseAnonKey) {
  // Este error debería detener la app si las claves faltan en .env
  throw new Error("Supabase URL or Anon Key is missing in .env file (make sure they start with VITE_)");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true // Aunque manejemos token manual, esto no daña
  }
});

// Mensaje para confirmar en consola del navegador
console.log('Supabase client initialized successfully.');