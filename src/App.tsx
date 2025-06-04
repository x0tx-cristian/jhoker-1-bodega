// src/App.tsx
import React, { useMemo, useCallback, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Navbar, NavbarBrand, NavbarContent, NavbarItem, Button,
    User as HeroUser, Link as UILink, // Tooltip se importa y usa dentro de Dropdown, no necesita estar aquí
    NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Spinner, Image, 
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar
} from '@heroui/react';
import { ChevronDownIcon, LogoutIcon } from './components/icons';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReferenciasPage from './pages/ReferenciasPage';
import UbicacionesPage from './pages/UbicacionesPage';
import CajasPage from './pages/CajasPage';
import HistorialPage from './pages/HistorialPage';

// --- Componente Layout Principal (Navbar y Contenido) ---
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, isAuthenticated, userId, rolId, rolNombre } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => { 
        logout(); 
        setIsMenuOpen(false); 
        navigate('/login'); 
    };

    const handleBrandClick = () => {
        navigate('/');
        setIsMenuOpen(false);
    };

    const displayUserName = useMemo(() => ( userId ? (userId.includes('@') ? userId.split('@')[0] : userId.substring(0,12)) : 'Usuario' ), [userId]);
    const userInitials = useMemo(() => displayUserName.substring(0,2).toUpperCase(), [displayUserName]);

    const menuItems = useMemo(() => [
        { name: "Dashboard", href: "/", roles: [1, 2, 3] },
        { name: "Cajas", href: "/cajas", roles: [1, 2, 3] },
        { name: "Ubicaciones", href: "/ubicaciones", roles: [1, 2] },
        { name: "Referencias", href: "/referencias", roles: [1] },
        { name: "Historial", href: "/historial", roles: [1] },
    ], []);

    const accessibleMenuItems = useMemo(() => (
        menuItems.filter(item => rolId !== null && item.roles.includes(rolId))
    ), [menuItems, rolId]);

    const isLinkActive = useCallback((path: string) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path) && path !== "/";
    }, [location.pathname]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900">
            {isAuthenticated && (
                 <Navbar 
                    isBordered 
                    isMenuOpen={isMenuOpen} 
                    onMenuOpenChange={setIsMenuOpen} 
                    maxWidth="full" 
                    className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-lg dark:backdrop-blur-lg shadow-lg print:hidden sticky top-0 z-50 border-b border-slate-300/70 dark:border-slate-700/70"
                    height="4.5rem" 
                 >
                    {/* Lado Izquierdo: Toggle y Marca */}
                    <NavbarContent justify="start" className="gap-2 md:gap-4 items-center">
                        <NavbarMenuToggle 
                            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"} 
                            className="sm:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md p-1.5" 
                        />
                        <NavbarBrand className="gap-3 items-center cursor-pointer mr-2 sm:mr-0" onClick={handleBrandClick}>
                            <Image 
                                src="/Logo-jhoker.svg" 
                                alt="JHOKER Logo"
                                width={130} 
                                height={40} 
                                className="object-contain flex-shrink-0"
                            />
                            <p className="font-bold text-xl text-slate-800 dark:text-white hidden md:block">
                                JHOKER Bodega
                            </p>
                        </NavbarBrand>
                    </NavbarContent>

                    {/* Centro: Links de Navegación (Desktop) */}
                    <NavbarContent className="hidden sm:flex gap-1" justify="center">
                        {accessibleMenuItems.map((item) => (
                            <NavbarItem key={item.href} isActive={isLinkActive(item.href)}>
                                <Button
                                    as={Link}
                                    to={item.href}
                                    size="md"
                                    variant="light"
                                    className={`font-medium text-sm px-4 py-2 rounded-lg transition-colors
                                                ${isLinkActive(item.href) 
                                                    ? "text-sky-500 dark:text-sky-400 bg-sky-500/10 dark:bg-sky-400/10 ring-1 ring-sky-500/30 dark:ring-sky-400/30" 
                                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                                                }`}
                                >
                                    {item.name}
                                </Button>
                            </NavbarItem>
                        ))}
                    </NavbarContent>

                    {/* Lado Derecho: Usuario y Logout (Desktop) */}
                    {/* ESTA SECCIÓN ES PARA DESKTOP, SE OCULTA EN MÓVIL (sm y menor) */}
                    <NavbarContent justify="end" className="hidden sm:flex items-center">
                        {userId && rolNombre && ( 
                            <Dropdown placement="bottom-end" backdrop="blur" radius="lg" shadow="md" 
                                classNames={{
                                    trigger: "p-0", // Quitar padding del trigger si es un botón
                                    content: "dark:bg-slate-800/95 border border-slate-700/50"
                                }}
                            >
                                <DropdownTrigger>
                                    {/* Usamos un div simple como trigger para aplicar hover al grupo */}
                                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors">
                                        <Avatar
                                          size="sm"
                                          isBordered
                                          src={undefined} 
                                          name={userInitials}
                                          color="secondary"
                                          className="ring-1 ring-offset-1 ring-offset-white dark:ring-offset-slate-800 ring-secondary-300 dark:ring-secondary-500 transition-transform group-data-[hover=true]:scale-105 flex-shrink-0"
                                        />
                                        {/* El texto del usuario solo se muestra en 'md' y más grandes DENTRO de este bloque 'sm:flex' */}
                                        <div className="hidden md:flex flex-col items-start">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">{displayUserName}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{rolNombre}</span>
                                        </div>
                                        <ChevronDownIcon className="ml-1 w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    </div>
                                </DropdownTrigger>
                                <DropdownMenu 
                                    aria-label="User Actions" 
                                    variant="flat"
                                    disabledKeys={["user_info_header"]}
                                    onAction={(key) => { if (key === "logout") handleLogout(); }}
                                    itemClasses={{
                                        base: "gap-3 data-[hover=true]:bg-slate-100 dark:data-[hover=true]:bg-slate-700/50 rounded-lg",
                                        title: "font-medium text-sm",
                                    }}
                                    className="min-w-[230px] p-1"
                                >
                                    <DropdownItem key="user_info_header" isReadOnly className="h-auto py-2.5 px-3 gap-2 opacity-100 cursor-default border-b border-slate-200 dark:border-slate-700/50 mb-1" textValue={`Info: ${userId}`}>
                                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">Sesión Activa</p>
                                        <p className="text-xs text-primary dark:text-primary-400 font-mono break-all max-w-[190px] truncate" title={userId || ""}>{userId}</p>
                                    </DropdownItem>
                                    <DropdownItem key="logout" className="text-danger-500 dark:text-danger-400" color="danger" startContent={<LogoutIcon className="w-5 h-5"/>}>
                                        Cerrar Sesión
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </NavbarContent>

                    {/* Menú Móvil */}
                    <NavbarMenu className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl pt-2 pb-4 space-y-1 shadow-2xl border-r border-slate-200 dark:border-slate-700/60">
                        {isAuthenticated && userId && rolNombre && (
                            <NavbarMenuItem className="border-b border-slate-200 dark:border-slate-700 pb-3 mb-3 px-2">
                                 <HeroUser 
                                    name={displayUserName} 
                                    description={rolNombre} 
                                    avatarProps={{ 
                                        size: "md", 
                                        isBordered: true, 
                                        name: userInitials, 
                                        color: "secondary" 
                                    }}
                                    classNames={{ 
                                        name: "text-base font-semibold text-slate-700 dark:text-white",
                                        description: "text-sm text-slate-500 dark:text-slate-300" 
                                    }}
                                />
                            </NavbarMenuItem>
                        )}
                        {accessibleMenuItems.map((item) => (
                        <NavbarMenuItem key={item.href}>
                            <UILink 
                                as={Link} 
                                className={`w-full block px-3 py-3 rounded-lg text-lg font-medium transition-all duration-150 ease-in-out
                                            ${isLinkActive(item.href) 
                                                ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-white shadow-md scale-105"
                                                : "text-slate-800 dark:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70" 
                                            }`}
                                to={item.href} 
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </UILink>
                        </NavbarMenuItem>
                        ))}
                         <NavbarMenuItem className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-700"> 
                             <Button 
                                 size="lg"
                                 color="danger" 
                                 variant="light" 
                                 onPress={handleLogout} 
                                 className="w-full font-semibold text-danger-500 dark:text-danger-300 hover:bg-danger-500/10 dark:hover:text-danger-200"
                                 startContent={<LogoutIcon className="w-5 h-5"/>}
                             > 
                                 Cerrar Sesión 
                             </Button> 
                         </NavbarMenuItem>
                    </NavbarMenu>
                </Navbar>
            )}
            <main className="flex-grow p-4 sm:p-6 md:p-8">
                {children}
            </main>
        </div>
    );
};

// --- El resto del componente App (lógica de rutas) ---
function App() {
  console.log("Renderizando App vFinal con Navbar v12 (Fix Desktop User Dropdown y TS)");
  const { rolId, isLoading: isLoadingAuth } = useAuth();

  const isAdminApp = rolId === 1;
  const isOperarioPTApp = rolId === 2;

  if (isLoadingAuth) { return (<div className="flex flex-col justify-center items-center min-h-screen bg-slate-100 dark:bg-slate-900"><Spinner size="lg" label="Iniciando Aplicación..." color="primary" /><p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Por favor, espere.</p></div>); }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={ <MainLayout><DashboardPage /></MainLayout> } />
        <Route path="/cajas" element={<MainLayout><CajasPage /></MainLayout>} />
        {(isAdminApp || isOperarioPTApp) && (<Route path="/ubicaciones" element={<MainLayout><UbicacionesPage /></MainLayout>} />)}
        {isAdminApp && <Route path="/referencias" element={<MainLayout><ReferenciasPage /></MainLayout>} />}
        {isAdminApp && <Route path="/historial" element={<MainLayout><HistorialPage /></MainLayout>} />}
        <Route path="*" element={
            <MainLayout>
                <div className="flex flex-col items-center justify-center text-center h-full py-10 md:py-16">
                    <Image src="/Logo-jhoker.svg" alt="Error 404" width={120} className="opacity-30 mb-8" />
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-700 dark:text-slate-200 mb-4">Error 404</h1>
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-md">
                        ¡Vaya! Parece que la página que buscas se ha perdido en la bodega.
                    </p>
                    <Button as={Link} to="/" color="primary" size="lg" variant="solid" className="font-semibold px-8 py-3 shadow-md dark:shadow-primary-500/40">
                        Volver al Inicio
                    </Button>
                </div>
            </MainLayout>} 
        />
      </Route>
    </Routes>
  );
}
export default App;