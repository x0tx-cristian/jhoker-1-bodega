// src/main.tsx (Modificado para react-hot-toast)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.tsx';
import { Toaster } from 'react-hot-toast'; // <-- Importar Toaster
import '@/styles/globals.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <HeroUIProvider>
          <AuthProvider>
            <App />
            {/* Añadir Toaster aquí, fuera de App pero dentro de los Providers */}
            <Toaster
                position="top-right" // Posición de las notificaciones
                reverseOrder={false} // Orden
                toastOptions={{
                    // Estilos y duraciones por defecto
                    className: '',
                    duration: 5000,
                    style: {
                    background: '#363636', // Fondo oscuro ejemplo
                    color: '#fff',         // Texto blanco ejemplo
                    },
                    // Estilos por tipo
                    success: { duration: 3000, /* theme: { primary: 'green', secondary: 'black', }, */ },
                    error: { duration: 5000, /* theme: { primary: 'red', secondary: 'black', }, */ },
                }}
             />
          </AuthProvider>
        </HeroUIProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
} else { console.error("Elemento root no encontrado."); }