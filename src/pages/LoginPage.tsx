// src/pages/LoginPage.tsx
import React, { useState, useCallback } from 'react';
import { Input, Button, Card, CardHeader, CardBody, CardFooter, Spinner } from "@heroui/react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { NombreRol } from '../types';
// CORREGIDO: Quitar import de toast no usado
// import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    let loginSuccess = false;

    try {
      const { data: userDataArray, error: rpcError } = await supabase.rpc(
        'get_usuario_para_login', { p_nombre_usuario: nombreUsuario }
      );

      if (rpcError || !userDataArray || userDataArray.length === 0) {
        setError('Credenciales inválidas.');
        return;
      }

      const user = userDataArray[0];
      const { user_id: userIdDb, user_rol_id: rolIdDb, password_hash: passwordHashDb, user_activo: activoDb } = user;

      if (!activoDb) { setError('Usuario inactivo.'); return; }
      if (!passwordHashDb) { setError('Error config.'); return; }

      let passwordIsValid = false;
      try { passwordIsValid = bcrypt.compareSync(password, passwordHashDb); }
      catch (bcryptError: any) { setError(`Error verificando.`); return; }

      if (!passwordIsValid) { setError('Credenciales inválidas.'); return; }

      let rolNombreDb: NombreRol = 'Rol Desconocido';
      if (rolIdDb != null) {
          try {
              const { data: rolData, error: rolError } = await supabase.from('roles').select('nombre_rol').eq('id', rolIdDb).single();
              if (rolError) { throw rolError; }
              if (rolData?.nombre_rol && ['Administrador', 'Operario PT', 'Operario Insumos'].includes(rolData.nombre_rol)) {
                  rolNombreDb = rolData.nombre_rol as NombreRol;
              }
          } catch (e: any) { /* Ignorar error de rol y usar 'Desconocido' */ }
      }

      if (userIdDb && rolIdDb != null) {
        const simulatedToken = `frontend-bcrypt-ok-${userIdDb}-${Date.now()}`;
        login(simulatedToken, userIdDb, rolIdDb, rolNombreDb);
        loginSuccess = true;
      } else { setError("Datos de usuario inválidos."); }

    } catch (err: any) {
      setError(`Error inesperado: ${err.message || 'Error'}`);
    } finally {
      setIsLoading(false);
      if (loginSuccess) {
        navigate('/');
      }
    }
  }, [nombreUsuario, password, login, navigate]);

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
              autoComplete="username"
            />
            <Input
              isRequired label="Contraseña" placeholder="Ingrese contraseña" type="password"
              value={password} onValueChange={setPassword} isDisabled={isLoading}
              variant="bordered" classNames={{ inputWrapper: "dark:border-gray-600", label: "dark:text-gray-300", input:"dark:text-white" }}
              autoComplete="current-password"
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

export default LoginPage;