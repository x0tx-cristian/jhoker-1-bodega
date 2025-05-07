// src/pages/LoginPage.tsx (FINAL vFINAL v4 - Completo y Corregido)
import React, { useState, useCallback } from 'react'; // Añadir useCallback
import { Input, Button, Card, CardHeader, CardBody, CardFooter, Spinner } from "@heroui/react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Hook del contexto Auth
import { supabase } from '../lib/supabaseClient';   // Cliente Supabase
import bcrypt from 'bcryptjs';                   // Para verificación de hash
import { NombreRol } from '../types';            // Importar tipo NombreRol
import toast from 'react-hot-toast';             // Importar toast

const LoginPage: React.FC = () => {
  // --- Estados ---
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Para el spinner del botón
  const navigate = useNavigate();
  const { login } = useAuth(); // Obtiene la función login del contexto (espera rolNombre)

  // --- Manejador del Login ---
  const handleLogin = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Evitar recarga de página
    setError(null);         // Limpiar errores anteriores
    setIsLoading(true);     // Mostrar spinner en botón
    console.log("[Login] Intentando login:", nombreUsuario);
    let loginSuccess = false; // Flag para saber si el login fue exitoso

    try {
      // 1. Obtener datos del usuario (incluye hash y rolId)
      console.log(`[Login] Llamando RPC get_usuario_para_login(${nombreUsuario})...`);
      const { data: userDataArray, error: rpcError } = await supabase.rpc(
        'get_usuario_para_login', { p_nombre_usuario: nombreUsuario }
      );

      // Validar respuesta del RPC
      if (rpcError || !userDataArray || userDataArray.length === 0) {
        console.error("[Login] Error RPC o usuario no encontrado:", rpcError);
        setError('Credenciales inválidas.'); // Mensaje genérico
        return; // Detener aquí
      }

      // Extraer datos del usuario
      const user = userDataArray[0];
      const { user_id: userIdDb, user_rol_id: rolIdDb, password_hash: passwordHashDb, user_activo: activoDb } = user;

      // Validar estado activo y hash
      if (!activoDb) { console.log(`[Login] Usuario inactivo.`); setError('Usuario inactivo.'); return; }
      if (!passwordHashDb) { console.error(`[Login] Usuario sin hash.`); setError('Error config.'); return; }
      console.log("[Login] Usuario encontrado:", { id: userIdDb, rol: rolIdDb });

      // 2. Comparar contraseña con bcryptjs
      console.log("[Login] Comparando contraseña...");
      let passwordIsValid = false;
      try { passwordIsValid = bcrypt.compareSync(password, passwordHashDb); }
      catch (bcryptError: any) { console.error("[Login] Error bcrypt:", bcryptError); setError(`Error verificando.`); return; }

      if (!passwordIsValid) { console.log(`[Login] Contraseña inválida.`); setError('Credenciales inválidas.'); return; }
      console.log("[Login] Contraseña válida.");

      // 3. Obtener nombre del Rol
      let rolNombreDb: NombreRol = 'Rol Desconocido';
      if (rolIdDb != null) {
          console.log(`[Login] Obteniendo nombre rol ID: ${rolIdDb}...`);
          try {
              const { data: rolData, error: rolError } = await supabase.from('roles').select('nombre_rol').eq('id', rolIdDb).single();
              if (rolError) { throw rolError; }
              if (rolData?.nombre_rol && ['Administrador', 'Operario PT', 'Operario Insumos'].includes(rolData.nombre_rol)) {
                  rolNombreDb = rolData.nombre_rol as NombreRol;
              } else { console.warn(`[Login] Rol ID ${rolIdDb} o nombre '${rolData?.nombre_rol}' inválido.`); }
          } catch (e: any) { console.error("Excepción fetch rol:", e); /* Continuar con rol 'Desconocido' */ }
      } else { console.warn("[Login] rolIdDb es null."); }
      console.log(`[Login] Rol Nombre final: ${rolNombreDb}`);

      // 4. Autenticación Exitosa -> Actualizar Contexto
      if (userIdDb && rolIdDb != null) {
        const simulatedToken = `frontend-bcrypt-ok-${userIdDb}-${Date.now()}`;
        login(simulatedToken, userIdDb, rolIdDb, rolNombreDb); // <-- Pasa rolNombre
        console.log("[Login] Contexto Auth actualizado.");
        loginSuccess = true; // Marcar como exitoso para la redirección
      } else { setError("Datos de usuario inválidos."); console.error("[Login] Faltan userId/rolId", {userIdDb, rolIdDb}); }

    } catch (err: any) { // Captura errores generales
      console.error("[Login] Error general:", err);
      setError(`Error inesperado: ${err.message || 'Error'}`);
    } finally {
      setIsLoading(false); // Quita spinner del botón
      if (loginSuccess) {
        console.log("[Login] Redirigiendo a / ...");
        navigate('/'); // Redirige SOLO si todo fue bien
      }
    }
  }, [nombreUsuario, password, login, navigate]); // Dependencias del useCallback

  // --- JSX del Formulario ---
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm p-6 shadow-lg dark:bg-gray-800">
        <CardHeader className="flex justify-center pb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Iniciar Sesión - JHOKER</h1>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardBody className="flex flex-col gap-4">
            <Input
              isRequired label="Usuario / Email" placeholder="Ingrese usuario"
              value={nombreUsuario} onValueChange={setNombreUsuario} isDisabled={isLoading}
              variant="bordered" classNames={{ inputWrapper: "dark:border-gray-600", label: "dark:text-gray-300", input:"dark:text-white" }}
              autoComplete="username" // Ayuda a navegadores
            />
            <Input
              isRequired label="Contraseña" placeholder="Ingrese contraseña" type="password"
              value={password} onValueChange={setPassword} isDisabled={isLoading}
              variant="bordered" classNames={{ inputWrapper: "dark:border-gray-600", label: "dark:text-gray-300", input:"dark:text-white" }}
              autoComplete="current-password" // Ayuda a navegadores
            />
            {error && <p className="text-danger text-small px-1">{error}</p>}
          </CardBody>
          <CardFooter className="flex justify-center pt-4">
            <Button type="submit" color="primary" isLoading={isLoading} fullWidth spinner={<Spinner size="sm" color="current"/>}>
              Ingresar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

// Exportar componente
export default LoginPage;