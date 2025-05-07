// src/contexts/AuthContext.tsx (FINAL v4 - Completo y Verificado)
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// Importar tipos actualizados
import { AuthContextType, NombreRol } from '../types'; // Ajusta la ruta si es necesario
import toast from 'react-hot-toast'; // Para notificaciones

// Crear el Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props del Provider
interface AuthProviderProps {
  children: ReactNode;
}

// --- Componente Provider ---
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // --- Estados ---
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [rolId, setRolId] = useState<number | null>(null);
  const [rolNombre, setRolNombre] = useState<NombreRol | null>(null); // <--- Usa el tipo NombreRol
  const [isLoading, setIsLoading] = useState(true); // Carga inicial

  // --- Cargar Sesión al Inicio ---
  useEffect(() => {
    console.log("[AuthContext] Intentando recuperar sesión...");
    let sessionIsValid = false;
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUserId = localStorage.getItem('userId');
      const storedRolId = localStorage.getItem('rolId');
      const storedRolNombre = localStorage.getItem('rolNombre'); // Recuperar

      if (storedToken && storedUserId && storedRolId && storedRolNombre) {
        const parsedRolId = parseInt(storedRolId, 10);
        // Validar que el nombre del rol sea uno de los conocidos
        if (!isNaN(parsedRolId) && ['Administrador', 'Operario PT', 'Operario Insumos'].includes(storedRolNombre)) {
            setAuthToken(storedToken);
            setUserId(storedUserId);
            setRolId(parsedRolId);
            setRolNombre(storedRolNombre as NombreRol); // Casteo seguro
            sessionIsValid = true;
            console.log("[AuthContext] Sesión recuperada OK:", {userId: storedUserId, rolId: parsedRolId, rolNombre: storedRolNombre});
        } else {
            console.warn("[AuthContext] Datos de sesión inválidos en localStorage. Limpiando.");
            localStorage.clear();
        }
      } else {
        console.log("[AuthContext] No hay sesión guardada.");
      }
    } catch (error) {
      console.error("[AuthContext] Error leyendo localStorage:", error);
      localStorage.clear(); // Limpiar si hay error
    } finally {
      setIsLoading(false); // Termina carga inicial
      console.log("[AuthContext] Carga inicial completa.", sessionIsValid ? "Sesión activa." : "Sin sesión.");
    }
  }, []); // Ejecutar solo una vez

  // --- Función Login ---
  const login = (token: string, uid: string, rid: number, rnombre: NombreRol) => { // Recibe NombreRol
    try {
      console.log("[AuthContext] Guardando sesión:", {uid, rid, rnombre});
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', uid);
      localStorage.setItem('rolId', rid.toString());
      localStorage.setItem('rolNombre', rnombre); // Guardar nombre
      setAuthToken(token); setUserId(uid); setRolId(rid); setRolNombre(rnombre); // Actualizar estado
    } catch (error) {
      console.error("[AuthContext] Error guardando sesión en localStorage:", error);
      toast.error("No se pudo guardar la sesión localmente.");
    }
  };

  // --- Función Logout ---
  const logout = () => {
    try {
      console.log("[AuthContext] Cerrando sesión...");
      localStorage.removeItem('authToken'); localStorage.removeItem('userId'); localStorage.removeItem('rolId'); localStorage.removeItem('rolNombre'); // Limpiar nombre
      setAuthToken(null); setUserId(null); setRolId(null); setRolNombre(null); // Limpiar estado
      console.log("[AuthContext] Sesión cerrada.");
    } catch (error) { console.error("[AuthContext] Error limpiando localStorage:", error); }
  };

  // --- Valor Derivado ---
  const isAuthenticated = !!authToken && !!userId;

  // --- Proveedor ---
  return (
    <AuthContext.Provider value={{ authToken, userId, rolId, rolNombre, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Hook Personalizado ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) { throw new Error('useAuth debe usarse dentro de AuthProvider'); }
  return context;
};