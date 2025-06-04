// src/pages/LoginPage.tsx
import React, { useState, useCallback } from 'react';
import { Input, Button, Card, CardHeader, CardBody, CardFooter, Spinner, Image } from "@heroui/react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { NombreRol } from '../types';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        console.error("Error Supabase Auth:", authError);
        setError('Credenciales inválidas o error de autenticación.');
        toast.error('Credenciales inválidas.');
        setIsLoading(false); return;
      }

      if (authData?.user && authData?.session) {
        const supabaseUserId = authData.user.id;
        const { data: publicUserData, error: publicUserError } = await supabase
          .from('usuarios')
          .select('id, rol_id, nombre_completo, activo, roles!inner (nombre_rol)')
          .eq('id', supabaseUserId)
          .single();

        if (publicUserError || !publicUserData) {
          console.error("Error obteniendo datos de public.usuarios:", publicUserError);
          await supabase.auth.signOut().catch(err => console.error("Error en signOut forzado", err));
          setError('Error al obtener perfil de usuario.');
          toast.error('Error de perfil.');
          setIsLoading(false); return;
        }

        if (!publicUserData.activo) {
          await supabase.auth.signOut().catch(err => console.error("Error en signOut forzado por inactividad", err));
          setError('Usuario inactivo.');
          toast.error('Usuario inactivo.');
          setIsLoading(false); return;
        }

        const rolIdDb = publicUserData.rol_id as number;
        
        // CORRECCIÓN DEL CASTEO DE ROLES:
        let resolvedRolNombre: NombreRol = 'Rol Desconocido';
        // Supabase con !inner y .single() en un join 1-a-1 devuelve el campo anidado como objeto, no array.
        if (publicUserData.roles && typeof publicUserData.roles === 'object' && !Array.isArray(publicUserData.roles)) {
          resolvedRolNombre = (publicUserData.roles as { nombre_rol: NombreRol })?.nombre_rol || 'Rol Desconocido';
        } else if (publicUserData.roles && Array.isArray(publicUserData.roles) && publicUserData.roles.length > 0) {
          // Fallback por si acaso Supabase devuelve un array con un solo elemento
          resolvedRolNombre = (publicUserData.roles[0] as { nombre_rol: NombreRol })?.nombre_rol || 'Rol Desconocido';
          console.warn("[LoginPage] 'publicUserData.roles' fue un array, se usó el primer elemento.");
        } else {
          console.warn("[LoginPage] 'publicUserData.roles' no es un objeto esperado o está vacío:", publicUserData.roles);
        }
        const rolNombreDb = resolvedRolNombre;
        
        login(authData.session.access_token, supabaseUserId, rolIdDb, rolNombreDb);
        loginSuccess = true;
        toast.success(`Bienvenido ${publicUserData.nombre_completo || email}!`);
      } else {
        setError("No se pudo obtener la sesión. Intente de nuevo.");
        toast.error("Error de sesión.");
      }
    } catch (err: any) {
      console.error("Error inesperado en login:", err);
      setError(`Error inesperado: ${err.message || 'Contacte a soporte'}`);
      toast.error("Error inesperado.");
    } finally {
      setIsLoading(false);
      if (loginSuccess) {
        navigate('/');
      }
    }
  }, [email, password, login, navigate]);

  // El JSX de LoginPage (la parte visual) permanece igual que la versión anterior.
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen w-full overflow-hidden px-4 bg-slate-950">
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 animate-gradient-xy"
          style={{
            backgroundImage: 'linear-gradient(-45deg, #020617, #0f172a, #132239, #082f49, #020617)',
            backgroundSize: '400% 400%',
            animation: 'gradient-xy 25s ease infinite',
          }}
        ></div>
        <div className="absolute inset-0">
          {[...Array(7)].map((_, i) => { 
            const isCircle = Math.random() > 0.4;
            const size = isCircle ? Math.random() * (150 - 30) + 30 : Math.random() * (220 - 80) + 80;
            const height = isCircle ? size : Math.random() * (50 - 20) + 20;
            const duration = Math.random() * (35 - 15) + 15;
            const delay = Math.random() * 8;
            const xStart = `${Math.random() * (40) - 20}vw`;
            const yStart = `${Math.random() * (40) - 20}vh`;
            const xMid = `${Math.random() * (80) - 40}vw`;
            const yMid = `${Math.random() * (80) - 40}vh`;
            const xEnd = `${Math.random() * (40) - 20}vw`;
            const yEnd = `${Math.random() * (40) - 20}vh`;
            return (
              <div
                key={`shape-${i}`}
                className={`absolute animate-float ${isCircle ? 'rounded-full bg-sky-500/5 dark:bg-sky-600/5' : 'h-16 bg-indigo-500/5 dark:bg-indigo-600/5'}`}
                style={{
                  width: `${size}px`,
                  height: `${height}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  borderRadius: isCircle ? '9999px' : `${Math.random() * (50 - 20) + 20}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  animationTimingFunction: i % 2 === 0 ? 'ease-in-out' : 'linear',
                  // @ts-ignore 
                  '--x-start': xStart, '--y-start': yStart,
                  '--x-mid': xMid, '--y-mid': yMid,
                  '--x-end': xEnd, '--y-end': yEnd,
                  '--rotate-start': `${Math.random() * 360}deg`,
                  '--rotate-mid': `${Math.random() * (440) - 220}deg`,
                  '--rotate-end': `${Math.random() * (720) - 360}deg`,
                  '--scale-start': Math.random() * (0.7 - 0.3) + 0.3,
                  '--scale-mid': Math.random() * (1.5 - 0.9) + 0.9,
                  '--scale-end': Math.random() * (0.7 - 0.3) + 0.3,
                  '--opacity-start': Math.random() * (0.07 - 0.03) + 0.03,
                  '--opacity-mid': Math.random() * (0.3 - 0.15) + 0.15,
                  '--opacity-end': Math.random() * (0.07 - 0.03) + 0.03,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <Image
            src="/Logo-jhoker.svg" alt="JHOKER Logo" width={220} height={75} 
            className="object-contain mb-10 drop-shadow-lg" removeWrapper 
        />
        <Card className="w-full p-6 md:p-8 shadow-2xl bg-slate-800/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-600/40 dark:border-slate-700/50 rounded-2xl">
          <CardHeader className="flex flex-col items-center text-center pb-5">
            <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white tracking-tight">JHOKER Bodega</h1>
            <p className="text-sm text-slate-300 dark:text-slate-400 mt-2">Ingresa para gestionar tu inventario.</p>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardBody className="flex flex-col gap-5">
              <Input
                isRequired label="Email" placeholder="tu@email.com" type="email"
                value={email} onValueChange={setEmail} isDisabled={isLoading}
                variant="bordered" labelPlacement="outside"
                classNames={{
                  label: "text-slate-200 dark:text-slate-300 font-medium text-sm",
                  inputWrapper: "bg-white/5 dark:bg-slate-700/20 border-slate-500/50 dark:border-slate-600/40 group-data-[hover=true]:border-sky-500 dark:group-data-[hover=true]:border-sky-400 group-data-[focus=true]:border-sky-500 dark:group-data-[focus=true]:border-sky-400 shadow-sm",
                  input: "text-white placeholder:text-slate-400 dark:placeholder:text-slate-500",
                }}
                autoComplete="email"
              />
              <Input
                isRequired label="Contraseña" placeholder="••••••••" type="password"
                value={password} onValueChange={setPassword} isDisabled={isLoading}
                variant="bordered" labelPlacement="outside"
                classNames={{
                  label: "text-slate-200 dark:text-slate-300 font-medium text-sm",
                  inputWrapper: "bg-white/5 dark:bg-slate-700/20 border-slate-500/50 dark:border-slate-600/40 group-data-[hover=true]:border-sky-500 dark:group-data-[hover=true]:border-sky-400 group-data-[focus=true]:border-sky-500 dark:group-data-[focus=true]:border-sky-400 shadow-sm",
                  input: "text-white placeholder:text-slate-400 dark:placeholder:text-slate-500",
                }}
                autoComplete="current-password"
              />
              {error && <p className="text-red-400 text-sm text-center px-1">{error}</p>}
            </CardBody>
            <CardFooter className="pt-8">
              <Button type="submit" color="primary" isLoading={isLoading} fullWidth size="lg"
                variant="solid" className="font-semibold text-base shadow-xl shadow-sky-500/30 hover:shadow-sky-400/50 active:shadow-md transition-all duration-300 ease-out"
                spinner={<Spinner size="sm" color="white" />}
              >Ingresar</Button>
            </CardFooter>
          </form>
        </Card>
        <p className="text-center text-xs text-slate-400/70 dark:text-slate-500/70 mt-10">
            © {new Date().getFullYear()} JHOKER S.A.S. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
export default LoginPage;