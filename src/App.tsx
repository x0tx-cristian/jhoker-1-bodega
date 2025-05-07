// // src/App.tsx (FINAL v16 - Importa useCallback + Completo)
// import React, { useState, useMemo, useCallback } from 'react'; // <-- Añadir useCallback
// import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
// import {
//     HeroUIProvider, Navbar, NavbarBrand, NavbarContent, NavbarItem, Button,
//     User as HeroUser, Tooltip, Link as UILink,
//     NavbarMenuToggle, NavbarMenu, NavbarMenuItem,
//     Spinner
// } from '@heroui/react';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import ProtectedRoute from './routes/ProtectedRoute';
// import LoginPage from './pages/LoginPage';
// import DashboardPage from './pages/DashboardPage';
// import ReferenciasPage from './pages/ReferenciasPage';
// import UbicacionesPage from './pages/UbicacionesPage';
// import CajasPage from './pages/CajasPage';
// import HistorialPage from './pages/HistorialPage';
// // import { AcmeLogo } from './components/icons/AcmeLogo';

// // --- Componente Layout Principal (Usa useCallback) ---
// const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const { logout, isAuthenticated, userId, rolId, rolNombre } = useAuth();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [isMenuOpen, setIsMenuOpen] = useState(false);
//     const handleLogout = () => { logout(); navigate('/login'); };
//     const isAdmin = rolId === 1; const isOperarioPT = rolId === 2; const isOperarioInsumos = rolId === 3;
//     const displayUserName = useMemo(() => ( userId ? (userId.includes('@') ? userId.split('@')[0] : userId.substring(0, 8) + '...') : 'Usuario' ), [userId]);
//     const menuItems = useMemo(() => [ { name: "Dashboard", href: "/", roles: [1, 2, 3] }, { name: "Cajas", href: "/cajas", roles: [1, 2, 3] }, { name: "Ubicaciones", href: "/ubicaciones", roles: [1, 2] }, { name: "Referencias", href: "/referencias", roles: [1] }, { name: "Historial", href: "/historial", roles: [1] }, ], []);
//     const accessibleMenuItems = useMemo(() => ( menuItems.filter(item => rolId !== null && item.roles.includes(rolId)) ), [menuItems, rolId]);
//     // Usar useCallback para la función isLinkActive
//     const isLinkActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

//     return (
//         <div className="flex flex-col min-h-screen">
//             {isAuthenticated && (
//                  <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} maxWidth="full" className="dark:bg-gray-800 print:hidden">
//                     <NavbarContent justify="start"> <NavbarMenuToggle aria-label={isMenuOpen ? "Cerrar" : "Abrir"} className="sm:hidden dark:text-white" /> <NavbarBrand> <p className="font-bold text-inherit dark:text-white">JHOKER Bodega</p> </NavbarBrand> </NavbarContent>
//                     <NavbarContent className="hidden sm:flex gap-4" justify="center"> {accessibleMenuItems.map((item) => ( <NavbarItem key={item.href} isActive={isLinkActive(item.href)}> <UILink as={Link} to={item.href} size="sm" className={`nav-link ${isLinkActive(item.href) ? 'font-bold text-primary' : 'dark:text-gray-300'}`}> {item.name} </UILink> </NavbarItem> ))} </NavbarContent>
//                     <NavbarContent justify="end"> {userId && rolNombre && ( <NavbarItem className="hidden lg:flex"><Tooltip content={`ID: ${userId}`}><HeroUser name={displayUserName} description={rolNombre} /></Tooltip></NavbarItem> )} <NavbarItem> <Button size="sm" color="danger" variant="flat" onPress={handleLogout}> Cerrar Sesión </Button> </NavbarItem> </NavbarContent>
//                     <NavbarMenu className="dark:bg-gray-800 bg-opacity-95 pt-6"> {accessibleMenuItems.map((item, index) => ( <NavbarMenuItem key={`${item.name}-${index}`}> <UILink as={Link} color={isLinkActive(item.href) ? "primary" : "foreground"} className="w-full dark:text-white" to={item.href} size="lg" onClick={() => setIsMenuOpen(false)}> {item.name} </UILink> </NavbarMenuItem> ))} <NavbarMenuItem className="mt-auto pt-4 border-t dark:border-gray-700"> <Button size="md" color="danger" variant="flat" onPress={handleLogout} className="w-full"> Cerrar Sesión </Button> </NavbarMenuItem> </NavbarMenu>
//                 </Navbar>
//             )}
//             <style>{`.nav-link { padding: 0.5rem 0.8rem; border-radius: 0.375rem; transition: background-color 0.2s ease-in-out; } .nav-link:hover { background-color: rgba(128, 128, 128, 0.1); color: #60A5FA; }`}</style>
//             <main className="flex-grow dark text-foreground bg-background p-4 md:p-6"> {children} </main>
//         </div>
//     );
// };

// // --- Componente App Principal (Define Rutas según Rol) ---
// function App() {
//   console.log("Renderizando App vFinal con useCallback");
//   const { rolId, isLoading: isLoadingAuth } = useAuth();
//   const isAdmin = rolId === 1; const isOperarioPT = rolId === 2; const isOperarioInsumos = rolId === 3;

//   if (isLoadingAuth) { return (<div className="flex justify-center items-center min-h-screen dark:bg-gray-900"><Spinner size="lg" label="Iniciando..." /></div>); }

//   return (
//     <Routes>
//       <Route path="/login" element={<LoginPage />} />
//       <Route element={<ProtectedRoute />}>
//         <Route path="/" element={ <MainLayout><DashboardPage /></MainLayout> } />
//         {(isAdmin || isOperarioPT || isOperarioInsumos) && <Route path="/cajas" element={<MainLayout><CajasPage /></MainLayout>} />}
//         {(isAdmin || isOperarioPT) && <Route path="/ubicaciones" element={<MainLayout><UbicacionesPage /></MainLayout>} />}
//         {isAdmin && <Route path="/referencias" element={<MainLayout><ReferenciasPage /></MainLayout>} />}
//         {isAdmin && <Route path="/historial" element={<MainLayout><HistorialPage /></MainLayout>} />}
//         <Route path="*" element={<MainLayout><div><h1 className="text-xl text-danger">404</h1><p>Página no encontrada.</p><Link to="/" className="text-primary">Inicio</Link></div></MainLayout>} />
//       </Route>
//     </Routes>
//   );
// }
// export default App;

// src/App.tsx (FINAL v18 - Limpio de TS6133 + Completo)
import React, { useMemo, useCallback, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Navbar, NavbarBrand, NavbarContent, NavbarItem, Button,
    User as HeroUser, Tooltip, Link as UILink, // Usaremos UILink de HeroUI/NextUI para NavbarItem
    NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Spinner
} from "@heroui/react"; // Quitado HeroUIProvider, va en main.tsx
// No necesitamos AuthProvider aquí, se usa en main.tsx
import { useAuth } from './contexts/AuthContext'; // Solo useAuth
import ProtectedRoute from './routes/ProtectedRoute';
// Importar todas las páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReferenciasPage from './pages/ReferenciasPage';
import UbicacionesPage from './pages/UbicacionesPage';
import CajasPage from './pages/CajasPage';
import HistorialPage from './pages/HistorialPage';
// import { AcmeLogo } from './components/icons/AcmeLogo'; // Opcional, comentar si no se usa

// --- Componente Layout Principal (Navbar y Contenido) ---
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, isAuthenticated, userId, rolId, rolNombre } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    // Roles para legibilidad y control de UI (Usados para filtrar menuItems)
    const isAdminLayout = useMemo(() => rolId === 1, [rolId]);
    const isOperarioPTLayout = useMemo(() => rolId === 2, [rolId]);
    const isOperarioInsumosLayout = useMemo(() => rolId === 3, [rolId]);

    // Nombre corto para UI
    const displayUserName = useMemo(() => (
        userId ? (userId.includes('@') ? userId.split('@')[0] : userId.substring(0, 8) + '...') : 'Usuario'
    ), [userId]);

    // Definir items del menú con sus rutas y roles permitidos
    const menuItems = useMemo(() => [
        { name: "Dashboard", href: "/", roles: [1, 2, 3] }, // Todos
        { name: "Cajas", href: "/cajas", roles: [1, 2, 3] }, // Todos
        { name: "Ubicaciones", href: "/ubicaciones", roles: [1, 2] }, // Admin y Op PT
        { name: "Referencias", href: "/referencias", roles: [1] }, // Solo Admin
        { name: "Historial", href: "/historial", roles: [1] }, // Solo Admin
    ], []);

    // Filtrar menú según el rol actual
    const accessibleMenuItems = useMemo(() => (
        menuItems.filter(item => rolId !== null && item.roles.includes(rolId))
    ), [menuItems, rolId]);

    const isLinkActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

    return (
        <div className="flex flex-col min-h-screen">
            {isAuthenticated && (
                 <Navbar
                    isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}
                    maxWidth="full" className="dark:bg-gray-800 print:hidden" // Ocultar Navbar al imprimir
                 >
                    <NavbarContent justify="start">
                        <NavbarMenuToggle aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"} className="sm:hidden dark:text-white" />
                        <NavbarBrand> <p className="font-bold text-inherit dark:text-white">JHOKER Bodega</p> </NavbarBrand>
                    </NavbarContent>

                    <NavbarContent className="hidden sm:flex gap-4" justify="center">
                        {accessibleMenuItems.map((item) => (
                            <NavbarItem key={item.href} isActive={isLinkActive(item.href)}>
                                {/* Usar UILink de HeroUI/NextUI dentro del Link de react-router-dom */}
                                <UILink as={Link} to={item.href} size="sm" className={`nav-link ${isLinkActive(item.href) ? 'font-bold text-primary dark:text-primary-400' : 'dark:text-gray-300'}`}>
                                    {item.name}
                                </UILink>
                            </NavbarItem>
                        ))}
                    </NavbarContent>

                    <NavbarContent justify="end">
                        {userId && rolNombre && ( <NavbarItem className="hidden lg:flex"><Tooltip content={`ID: ${userId}`} placement="bottom" delay={200}><HeroUser name={displayUserName} description={rolNombre} classNames={{description: "text-xs"}}/></Tooltip></NavbarItem> )}
                        <NavbarItem> <Button size="sm" color="danger" variant="flat" onPress={handleLogout}> Cerrar Sesión </Button> </NavbarItem>
                    </NavbarContent>

                    {/* Menú Desplegable para Móviles */}
                    <NavbarMenu className="dark:bg-gray-800 bg-opacity-95 pt-6">
                        {accessibleMenuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item.name}-${index}`}>
                            <UILink as={Link} color={isLinkActive(item.href) ? "primary" : "foreground"} className="w-full dark:text-white text-lg py-2 block" to={item.href} onClick={() => setIsMenuOpen(false)}> {/* Ajustado estilo y onClick */}
                                {item.name}
                            </UILink>
                        </NavbarMenuItem>
                        ))}
                         <NavbarMenuItem className="mt-auto pt-4 border-t dark:border-gray-700">
                             <Button size="md" color="danger" variant="flat" onPress={() => {handleLogout(); setIsMenuOpen(false);}} className="w-full"> Cerrar Sesión </Button>
                         </NavbarMenuItem>
                    </NavbarMenu>
                </Navbar>
            )}
            {/* Estilos (pueden ir a un CSS global) */}
            <style>{`.nav-link { padding: 0.5rem 0.8rem; border-radius: 0.375rem; /* rounded-md */ transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out; } .nav-link:hover { background-color: rgba(128, 128, 128, 0.1); /* Gris muy transparente */ }`}</style>
            <main className="flex-grow dark text-foreground bg-background p-4 md:p-6"> {children} </main>
        </div>
    );
};


// --- Componente App Principal (Define Rutas) ---
function App() {
  console.log("Renderizando App vFinal con Rutas Condicionales y Spinner (v18)");
  const { rolId, isLoading: isLoadingAuth } = useAuth(); // Usar isLoading del Auth

  // Determinar roles para renderizado condicional de rutas
  const isAdminApp = rolId === 1;
  const isOperarioPTApp = rolId === 2;
  // const isOperarioInsumosApp = rolId === 3; // No se usa directamente aquí para ocultar rutas, se filtra en CajasPage

  // Spinner mientras se carga la sesión
  if (isLoadingAuth) {
      return (<div className="flex justify-center items-center min-h-screen dark:bg-gray-900"><Spinner size="lg" label="Iniciando Aplicación..." labelColor="primary" /></div>);
  }

  return (
    // BrowserRouter y Providers globales están en src/main.tsx
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={ <MainLayout><DashboardPage /></MainLayout> } />
        {/* Cajas: Visible para todos los roles logueados (filtrado interno) */}
        <Route path="/cajas" element={<MainLayout><CajasPage /></MainLayout>} />
        {/* Ubicaciones: Admin y Operario PT */}
        {(isAdminApp || isOperarioPTApp) && (
          <Route path="/ubicaciones" element={<MainLayout><UbicacionesPage /></MainLayout>} />
        )}
        {/* Referencias y Historial: Solo Admin */}
        {isAdminApp && <Route path="/referencias" element={<MainLayout><ReferenciasPage /></MainLayout>} />}
        {isAdminApp && <Route path="/historial" element={<MainLayout><HistorialPage /></MainLayout>} />}
        {/* Fallback */}
        <Route path="*" element={<MainLayout><div><h1 className="text-xl text-danger mb-2">404 - No Encontrado</h1><p className="dark:text-gray-400">La página no existe o no tiene permiso.</p><Button as={Link} to="/" color="primary" variant="ghost" className="mt-6">Inicio</Button></div></MainLayout>} />
      </Route>
    </Routes>
  );
}
export default App;