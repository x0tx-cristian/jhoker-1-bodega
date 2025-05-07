// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from "@heroui/react"; // Para mostrar mientras carga

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Muestra un indicador de carga mientras se verifica el estado de autenticación
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Spinner label="Cargando..." color="primary" labelColor="primary" />
        </div>
    );
  }

  // Si no está autenticado (y ya no está cargando), redirige a la página de login
  if (!isAuthenticated) {
    console.log("Usuario no autenticado, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza el contenido de la ruta hija (Outlet)
  console.log("Usuario autenticado, mostrando ruta protegida.");
  return <Outlet />;
};

export default ProtectedRoute;