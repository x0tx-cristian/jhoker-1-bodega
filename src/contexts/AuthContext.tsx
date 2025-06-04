// src/contexts/AuthContext.tsx (Restaurando a la LÓGICA de v6.1 que funcionaba para la carga, con el fix de roles y TS2339)
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthContextType, NombreRol } from '../types';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import type { Subscription, User, Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [rolId, setRolId] = useState<number | null>(null);
  const [rolNombre, setRolNombre] = useState<NombreRol | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthContext] v6.1-Restored-Fixed: useEffect Montado.");
    let subscription: Subscription | null = null;
    let initialCheckDone = false;

    const handleAuthResolved = (sessionUser: User | null, sessionToken: string | null) => {
      console.log(`[AuthContext] v6.1-Restored-Fixed: handleAuthResolved - User: ${sessionUser ? sessionUser.id : 'null'}`);
      setAuthToken(sessionToken);
      setUserId(sessionUser?.id || null);

      if (sessionUser) {
        // Refactored to use async/await for fetching user profile
        (async () => {
          try {
            const { data: publicUserData, error: publicUserError } = await supabase
              .from('usuarios')
              .select('rol_id, activo, roles!inner (nombre_rol)')
              .eq('id', sessionUser.id)
              .single();

            if (publicUserError || !publicUserData) {
              console.warn("[AuthContext] v6.1-Restored-Fixed: Perfil no encontrado o error.", publicUserError);
              setRolId(null); setRolNombre(null);
              if (publicUserError && !publicUserError.message.toLowerCase().includes('results')) {
                 toast.error("Error al cargar datos del perfil.");
              }
            } else if (!publicUserData.activo) {
              console.warn("[AuthContext] v6.1-Restored-Fixed: Usuario de app inactivo. Procediendo a signOut.");
              // Added await here for consistency, though original only logged errors
              await supabase.auth.signOut().catch(err => console.error("Error en signOut (inactivo)", err));
              // After signOut, user state should ideally be cleared, which onAuthStateChange should handle.
              // For immediate feedback or state update if onAuthStateChange is slow:
              setRolId(null); setRolNombre(null); // Clear role info
            } else {
              let resolvedRolNombre: NombreRol = 'Rol Desconocido';
              // Check if publicUserData.roles is a single object (direct relation) or an array (many-to-many or incorrect type)
              if (publicUserData.roles && typeof publicUserData.roles === 'object' && !Array.isArray(publicUserData.roles)) {
                // This assumes 'roles' is a foreign table joined directly and Supabase returns it as an object
                resolvedRolNombre = (publicUserData.roles as { nombre_rol: NombreRol })?.nombre_rol || 'Rol Desconocido';
              } else if (publicUserData.roles && Array.isArray(publicUserData.roles) && publicUserData.roles.length > 0) {
                // This handles cases where 'roles' might be an array (e.g., if the join was not unique or setup differently)
                resolvedRolNombre = (publicUserData.roles[0] as { nombre_rol: NombreRol })?.nombre_rol || 'Rol Desconocido';
              } else {
                console.warn("[AuthContext] v6.1-Restored-Fixed: 'publicUserData.roles' estructura inesperada o vacía:", publicUserData.roles);
              }
              setRolId(publicUserData.rol_id as number);
              setRolNombre(resolvedRolNombre);
              console.log("[AuthContext] v6.1-Restored-Fixed: Perfil y rol cargados.");
            }
          } catch (err: any) {
            console.error("[AuthContext] v6.1-Restored-Fixed: Excepción en promesa de carga de perfil:", err);
            setRolId(null); setRolNombre(null);
            toast.error("Error al procesar datos del perfil."); // Added user feedback for catch block
          } finally {
            // This block ensures isLoading is set to false once the async operation (profile fetch) is complete
            if (!initialCheckDone) {
              setIsLoading(false);
              initialCheckDone = true;
              console.log("[AuthContext] v6.1-Restored-Fixed: Carga finalizada (desde async IIFE/perfil). isLoading: false");
            }
          }
        })();
      } else { // No hay sessionUser
        setRolId(null);
        setRolNombre(null);
        if (!initialCheckDone) {
          setIsLoading(false);
          initialCheckDone = true;
          console.log("[AuthContext] v6.1-Restored-Fixed: Carga finalizada (handleAuthResolved sin usuario). isLoading: false");
        }
      }
    };

    // Lógica de getSession de la v6 original que funcionaba para la carga
    supabase.auth.getSession().then(({ data: { session } }) => {
        console.log("[AuthContext] v6.1-Restored-Fixed: getSession() resultado. Sesión:", session ? "Presente" : "Ausente");
        if (!session && !initialCheckDone) {
            setAuthToken(null); setUserId(null); setRolId(null); setRolNombre(null);
            setIsLoading(false);
            initialCheckDone = true;
            console.log("[AuthContext] v6.1-Restored-Fixed: Carga inicial (no session por getSession) completa. isLoading: false");
        }
        // If session exists, onAuthStateChange will usually fire and call handleAuthResolved.
        // If there's a concern it might not, you could call handleAuthResolved here too:
        // else if (session) {
        //   handleAuthResolved(session.user, session.access_token);
        // }
    });
    // NO AÑADIR .catch AQUÍ a getSession().then(), si la promesa de getSession falla, se propaga y el comportamiento
    // por defecto es loguear el error no capturado.
    // Si se quiere manejar explícitamente, sería con try/catch en una función async.

    const { data: authListenerData } = supabase.auth.onAuthStateChange((event, session: Session | null) => {
      console.log(`[AuthContext] v6.1-Restored-Fixed: onAuthStateChange - Evento: ${event}, Sesión: ${session ? "Presente" : "Ausente"}`);
      // onAuthStateChange handles SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
      // It will provide the session user and token to handleAuthResolved.
      handleAuthResolved(session?.user || null, session?.access_token || null);
    });

    if (authListenerData?.subscription) {
        subscription = authListenerData.subscription;
    } else {
        console.warn("[AuthContext] v6.1-Restored-Fixed: No se pudo obtener la suscripción del listener.");
         // This case might lead to isLoading not being set to false if getSession also didn't find a session.
         if (!initialCheckDone) { // Check again, as getSession might have set it.
            setIsLoading(false);
            initialCheckDone = true; // Mark as done
            console.log("[AuthContext] v6.1-Restored-Fixed: Carga (sin listener y getSession sin sesión) completada. isLoading: false");
        }
    }

    return () => {
      if (subscription) {
        console.log("[AuthContext] v6.1-Restored-Fixed: useEffect Limpieza: Desuscribiéndose.");
        subscription.unsubscribe();
      }
    };
  }, []); // Array de dependencias VACÍO

  const login = (token: string, uid: string, rid: number, rnombre: NombreRol) => {
    console.log("[AuthContext] v6.1-Restored-Fixed: Función login llamada:", { uid, rid, rnombre });
    setAuthToken(token);
    setUserId(uid);
    setRolId(rid);
    setRolNombre(rnombre);
    if (isLoading) setIsLoading(false); // Ensure loading is false on explicit login
  };

  const logout = async () => {
    console.log("[AuthContext] v6.1-Restored-Fixed: Iniciando logout...");
    // setIsLoading(true); // Optional: set loading true during logout operation
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[AuthContext] v6.1-Restored-Fixed: Error en Supabase signOut:", error);
        toast.error("Error al cerrar sesión.");
      } else {
        console.log("[AuthContext] v6.1-Restored-Fixed: signOut llamado exitosamente.");
        toast.success("Sesión cerrada.");
        // State clearing (authToken, userId, etc.) will be handled by onAuthStateChange -> handleAuthResolved
      }
    } catch (error: any) {
      console.error("[AuthContext] v6.1-Restored-Fixed: Excepción durante logout:", error);
      toast.error(`Error inesperado: ${error.message}`);
    } finally {
        // Explicitly clear sensitive state here in case onAuthStateChange is delayed or fails
        // though handleAuthResolved(null, null) should eventually be called by onAuthStateChange.
        setAuthToken(null); setUserId(null); setRolId(null); setRolNombre(null);
        setIsLoading(false); // Ensure loading is false after logout attempt
    }
  };

  const isAuthenticated = !!authToken && !!userId && !!rolId;

  return (
    <AuthContext.Provider value={{ authToken, userId, rolId, rolNombre, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) { throw new Error('useAuth debe usarse dentro de AuthProvider'); }
  return context;
};