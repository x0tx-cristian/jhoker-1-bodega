// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react'; // Asegúrate que la importación sea correcta
import { AuthProvider } from './contexts/AuthContext';
import App from './App.tsx';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabaseClient'; 
import '@/styles/globals.css'; // Tu CSS global donde están las animaciones

if (import.meta.env.DEV) {
  (window as any).supabase = supabase;
  console.log("[main.tsx] Supabase client expuesto en window.supabase (SOLO DESARROLLO)");
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        {/* Aplicar clase 'dark' y clases base de Tailwind al HeroUIProvider */}
        <HeroUIProvider className="dark text-foreground bg-background min-h-screen"> 
          <AuthProvider>
            <App />
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    className: '',
                    duration: 5000,
                    style: {
                    background: '#334155', // Un gris-azulado oscuro (slate-700)
                    color: '#f1f5f9',     // Un blanco hueso (slate-100)
                    },
                    success: { 
                        duration: 3000,
                        iconTheme: { primary: '#22c55e', secondary: '#f1f5f9' } // Verde con texto claro
                    },
                    error: { 
                        duration: 5000,
                        iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } // Rojo con texto claro
                    },
                }}
             />
          </AuthProvider>
        </HeroUIProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
} else { console.error("Elemento root no encontrado."); }